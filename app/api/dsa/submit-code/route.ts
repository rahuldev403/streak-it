import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import {
  DsaSubmissionTable,
  DsaQuestionTable,
  UserDsaProgressTable,
} from "@/app/config/schema";
import { eq, and } from "drizzle-orm";

// OneCompiler Language Names
const LANGUAGE_NAMES: { [key: string]: string } = {
  python: "python", // Python 3
  javascript: "nodejs", // Node.js
  java: "java", // Java
  cpp: "cpp", // C++
  c: "c", // C
  typescript: "typescript", // TypeScript
  go: "go", // Go
  rust: "rust", // Rust
};

export async function POST(req: NextRequest) {
  try {
    const { userId, questionId, code, language } = await req.json();

    if (!userId || !questionId || !code || !language) {
      return NextResponse.json(
        {
          error: "Missing required fields: userId, questionId, code, language",
        },
        { status: 400 },
      );
    }

    const rapidApiKey = process.env.ONECOMPILER_RAPIDAPI_KEY;
    const rapidApiHost =
      process.env.ONECOMPILER_RAPIDAPI_HOST ||
      "onecompiler-apis.p.rapidapi.com";

    if (!rapidApiKey) {
      return NextResponse.json(
        { error: "OneCompiler API key not configured" },
        { status: 500 },
      );
    }

    // Get the question details
    const [question] = await db
      .select()
      .from(DsaQuestionTable)
      .where(
        and(
          eq(DsaQuestionTable.id, questionId),
          eq(DsaQuestionTable.userId, userId),
        ),
      )
      .limit(1);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found or doesn't belong to this user" },
        { status: 404 },
      );
    }

    // Parse test cases
    const testCases = JSON.parse(question.testCases);

    // Run code against all test cases
    const results = await runTestCases(
      code,
      language,
      testCases,
      rapidApiKey,
      rapidApiHost,
    );

    // Determine overall status
    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    const allPassed = passedCount === totalCount;

    let status = "accepted";
    if (!allPassed) {
      // Check if any test case had runtime error
      if (results.some((r) => r.status === "runtime_error")) {
        status = "runtime_error";
      } else if (results.some((r) => r.status === "time_limit_exceeded")) {
        status = "time_limit_exceeded";
      } else if (results.some((r) => r.status === "compilation_error")) {
        status = "compilation_error";
      } else {
        status = "wrong_answer";
      }
    }

    // Calculate average execution time and memory
    const avgExecutionTime =
      results.reduce((sum, r) => sum + (parseFloat(r.executionTime) || 0), 0) /
      results.length;
    const avgMemory =
      results.reduce((sum, r) => sum + (parseFloat(r.memory) || 0), 0) /
      results.length;

    // Save submission to database
    const [submission] = await db
      .insert(DsaSubmissionTable)
      .values({
        userId,
        questionId,
        code,
        language,
        status,
        executionTime: avgExecutionTime.toFixed(3),
        memory: avgMemory.toFixed(0),
        submittedAt: new Date().toISOString(),
        testCasesPassed: passedCount,
        totalTestCases: totalCount,
      })
      .returning();

    // Update user progress if all test cases passed
    if (allPassed) {
      await updateUserProgress(userId, question.difficulty);
    }

    return NextResponse.json({
      success: true,
      submission,
      results,
      summary: {
        totalTestCases: totalCount,
        passedTestCases: passedCount,
        status,
        allPassed,
      },
    });
  } catch (error: any) {
    console.error("Error executing code:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute code" },
      { status: 500 },
    );
  }
}

// Helper function to run all test cases
async function runTestCases(
  code: string,
  language: string,
  testCases: any[],
  apiKey: string,
  host: string,
): Promise<any[]> {
  const languageName = LANGUAGE_NAMES[language.toLowerCase()];

  if (!languageName) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const results = [];

  for (const testCase of testCases) {
    try {
      const result = await executeCode(
        code,
        languageName,
        testCase.input,
        testCase.expectedOutput,
        apiKey,
        host,
      );
      results.push(result);
    } catch (error: any) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: "",
        passed: false,
        status: "error",
        executionTime: "0",
        memory: "0",
        error: error.message,
      });
    }
  }

  return results;
}

// Helper function to wrap Java code with Main class
function wrapJavaCode(userCode: string, input: string): string {
  // If the code already has a Main class, return it as is
  if (
    userCode.includes("class Main") ||
    userCode.includes("public class Main")
  ) {
    return userCode;
  }

  // Detect method signature from Solution class: returnType methodName(params)
  const signatureMatch = userCode.match(
    /public\s+([\w\[\]]+)\s+(\w+)\s*\(([^)]*)\)/,
  );

  const returnType = signatureMatch ? signatureMatch[1] : "int";
  const methodName = signatureMatch ? signatureMatch[2] : "solve";
  const rawParams = signatureMatch ? signatureMatch[3].trim() : "int[] arr";

  const parsedParams = rawParams
    ? rawParams
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          const parts = p.split(/\s+/);
          const name = parts[parts.length - 1] || "arg";
          const type = parts.slice(0, -1).join(" ") || "int";
          return { type, name };
        })
    : [];

  const declarations: string[] = [];
  const callArgs: string[] = [];

  parsedParams.forEach((param, index) => {
    const keyExpr = `namedInputs.getOrDefault(\"${param.name}\", unnamedInput)`;
    const isLast = index === parsedParams.length - 1;

    if (param.type.includes("int[]")) {
      declarations.push(
        `        int[] ${param.name} = parseIntArray(${keyExpr});`,
      );
      callArgs.push(param.name);
    } else if (param.type === "int") {
      declarations.push(
        `        int ${param.name} = parseIntValue(${keyExpr});`,
      );
      callArgs.push(param.name);
    } else if (param.type === "String") {
      declarations.push(
        `        String ${param.name} = stripQuotes(${keyExpr}).trim();`,
      );
      callArgs.push(param.name);
    } else {
      // Fallback to raw string for unknown parameter types to avoid compile breaks.
      declarations.push(
        `        String ${param.name} = stripQuotes(${keyExpr}).trim();`,
      );
      callArgs.push(param.name);
    }

    if (!isLast) {
      declarations.push("");
    }
  });

  const methodCall = `solution.${methodName}(${callArgs.join(", ")})`;

  let invocationBlock = "";
  if (returnType === "void") {
    const firstParam = parsedParams[0];
    const outputExpr =
      firstParam && firstParam.type.includes("int[]")
        ? `Arrays.toString(${firstParam.name})`
        : '"OK"';

    invocationBlock = `
        ${methodCall};
        System.out.println(${outputExpr});`;
  } else if (returnType.includes("int[]")) {
    invocationBlock = `
        int[] result = ${methodCall};
        System.out.println(Arrays.toString(result));`;
  } else {
    invocationBlock = `
        ${returnType} result = ${methodCall};
        System.out.println(result);`;
  }

  const wrappedCode = `
import java.util.*;

${userCode}

public class Main {
  private static Map<String, String> parseNamedInputs(String input) {
    Map<String, String> values = new HashMap<>();
    java.util.regex.Matcher matcher = java.util.regex.Pattern
        .compile("(\\\\w+)\\\\s*=\\\\s*(\\\\[[^\\\\]]*\\\\]|[^,]+)")
        .matcher(input);

    while (matcher.find()) {
      values.put(matcher.group(1).trim(), matcher.group(2).trim());
    }

    return values;
  }

  private static String stripQuotes(String value) {
    if (value == null) return "";
    return value.replaceAll("^\\\"|\\\"$", "").trim();
  }

  private static int parseIntValue(String value) {
    String cleaned = stripQuotes(value)
        .replaceAll("[^0-9-]", "")
        .trim();

    if (cleaned.isEmpty()) return 0;
    return Integer.parseInt(cleaned);
  }

  private static int[] parseIntArray(String value) {
    String cleaned = stripQuotes(value)
        .replaceAll("\\\\[|\\\\]", "")
        .trim();

    if (cleaned.isEmpty()) return new int[0];

    String[] parts = cleaned.split(",");
    int[] arr = new int[parts.length];
    for (int i = 0; i < parts.length; i++) {
      arr[i] = Integer.parseInt(parts[i].trim());
    }
    return arr;
  }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
    String input = scanner.useDelimiter("\\\\A").hasNext() ? scanner.next() : "";
        scanner.close();
    Map<String, String> namedInputs = parseNamedInputs(input);
    String unnamedInput = input.trim();
${declarations.length > 0 ? declarations.join("\n") : ""}
        
        Solution solution = new Solution();
${invocationBlock}
    }
}`;

  return wrappedCode;
}

// Helper function to wrap Python code with input handling
function wrapPythonCode(userCode: string, input: string): string {
  // If the code already has input handling, return it as is
  if (userCode.includes("input()") || userCode.includes("sys.stdin")) {
    return userCode;
  }

  const signatureMatch = userCode.match(
    /def\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*([^:\n]+))?\s*:/,
  );

  const functionName = signatureMatch ? signatureMatch[1] : "solve";
  const rawParams = signatureMatch ? signatureMatch[2].trim() : "arr";
  const hasClassSolution = /class\s+Solution\b/.test(userCode);

  const parsedParams = rawParams
    ? rawParams
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          const noDefault = p.split("=")[0].trim();
          const [namePart, typePart] = noDefault.includes(":")
            ? noDefault.split(":").map((v) => v.trim())
            : [noDefault, ""];
          return { name: namePart, typeHint: typePart };
        })
        .filter((p) => p.name !== "self")
    : [];

  const declarationLines: string[] = [];
  const callArgs: string[] = [];

  parsedParams.forEach((param) => {
    const keyExpr = `named_inputs.get("${param.name}", raw_input)`;
    const typeHint = param.typeHint.toLowerCase();
    const isIntList =
      typeHint.includes("list") ||
      typeHint.includes("array") ||
      /(arr|nums|list|vector)/i.test(param.name);
    const isString =
      typeHint.includes("str") || /^(s|str|string|text)$/i.test(param.name);

    if (isIntList) {
      declarationLines.push(`
${param.name} = parse_int_list(${keyExpr})`);
    } else if (isString) {
      declarationLines.push(`
${param.name} = parse_string(${keyExpr})`);
    } else {
      declarationLines.push(`
${param.name} = parse_int_value(${keyExpr})`);
    }

    callArgs.push(param.name);
  });

  const callTarget = hasClassSolution ? `solver.${functionName}` : functionName;
  const firstListParam =
    parsedParams.find((p) => /(arr|nums|list|vector)/i.test(p.name))?.name ||
    "";

  const wrappedCode = `${userCode}

import re
import ast
import sys

def parse_named_inputs(raw):
    matches = re.findall(r'(\\w+)\\s*=\\s*(\\[[^\\]]*\\]|[^,\\n]+)', raw)
    return {k.strip(): v.strip() for k, v in matches}

def parse_string(value):
    return str(value).strip().strip('"').strip("'")

def parse_int_value(value):
    token = ''.join(ch for ch in parse_string(value) if ch.isdigit() or ch == '-')
    return int(token) if token else 0

def parse_int_list(value):
    text = parse_string(value)
    if not text:
      return []
    try:
      if text.startswith('['):
          parsed = ast.literal_eval(text)
          if isinstance(parsed, list):
              return [int(x) for x in parsed]
    except Exception:
      pass
    cleaned = re.sub(r'\\[|\\]', '', text).strip()
    if not cleaned:
      return []
    return [int(x.strip()) for x in cleaned.split(',') if x.strip()]

def format_list(values):
    return '[' + ','.join(str(x) for x in values) + ']'

raw_input = sys.stdin.read().strip()
named_inputs = parse_named_inputs(raw_input)
${declarationLines.join("\n")}

${hasClassSolution ? "solver = Solution()" : ""}
result = ${callTarget}(${callArgs.join(", ")})

if result is None:
    ${firstListParam ? `print(format_list(${firstListParam}))` : "print('OK')"}
elif isinstance(result, list):
    print(format_list(result))
else:
    print(result)`;

  return wrappedCode;
}

// Helper function to wrap JavaScript code with input handling
function wrapJavaScriptCode(userCode: string, input: string): string {
  // If the code already has input handling, return it as is
  if (
    userCode.includes("require('readline')") ||
    userCode.includes("process.stdin")
  ) {
    return userCode;
  }

  const classMethodMatch = userCode.match(
    /class\s+Solution[\s\S]*?\n\s*(?!constructor\b)(\w+)\s*\(([^)]*)\)\s*\{/,
  );
  const functionMatch = userCode.match(
    /function\s+(\w+)\s*\(([^)]*)\)|(?:const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/,
  );

  const hasClassSolution = Boolean(classMethodMatch);
  const functionName = hasClassSolution
    ? classMethodMatch?.[1] || "solve"
    : functionMatch?.[1] || functionMatch?.[3] || "solve";
  const rawParams = hasClassSolution
    ? classMethodMatch?.[2] || "arr"
    : functionMatch?.[2] || functionMatch?.[4] || "arr";

  const parsedParams = rawParams
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.split("=")[0].trim())
    .filter(Boolean);

  const declarationLines: string[] = [];
  const callArgs: string[] = [];

  parsedParams.forEach((param) => {
    const keyExpr = `getInput(namedInputs, "${param}", rawInput)`;

    if (/(arr|nums|list|vector|array)/i.test(param)) {
      declarationLines.push(`const ${param} = parseIntArray(${keyExpr});`);
    } else if (/^(s|str|string|text)$/i.test(param)) {
      declarationLines.push(`const ${param} = parseString(${keyExpr});`);
    } else {
      declarationLines.push(`const ${param} = parseIntValue(${keyExpr});`);
    }

    callArgs.push(param);
  });

  const firstArrayParam =
    parsedParams.find((p) => /(arr|nums|list|vector|array)/i.test(p)) || "";
  const targetCall = hasClassSolution
    ? `solution.${functionName}(${callArgs.join(", ")})`
    : `${functionName}(${callArgs.join(", ")})`;

  const wrappedCode = `${userCode}

const rawInput = require('fs').readFileSync(0, 'utf-8').trim();

function parseNamedInputs(raw) {
  const values = {};
  const regex = /(\\w+)\\s*=\\s*(\\[[^\\]]*\\]|[^,\\n]+)/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    values[match[1].trim()] = match[2].trim();
  }
  return values;
}

function getInput(namedInputs, key, fallback) {
  return Object.prototype.hasOwnProperty.call(namedInputs, key)
    ? namedInputs[key]
    : fallback;
}

function parseString(value) {
  return String(value).trim().replace(/^['"]|['"]$/g, '');
}

function parseIntValue(value) {
  const token = parseString(value).replace(/[^0-9-]/g, '');
  return token ? parseInt(token, 10) : 0;
}

function parseIntArray(value) {
  const text = parseString(value).replace(/\\[|\\]/g, '').trim();
  if (!text) return [];
  return text
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => parseInt(x, 10));
}

function formatArray(arr) {
  return '[' + arr.join(',') + ']';
}

const namedInputs = parseNamedInputs(rawInput);
${declarationLines.join("\n")}

${hasClassSolution ? "const solution = new Solution();" : ""}
const result = ${targetCall};

if (typeof result === 'undefined') {
  ${firstArrayParam ? `console.log(formatArray(${firstArrayParam}));` : "console.log('OK');"}
} else if (Array.isArray(result)) {
  console.log(formatArray(result));
} else {
  console.log(result);
}`;

  return wrappedCode;
}

// Helper function to wrap C++ code with main function
function wrapCppCode(userCode: string, input: string): string {
  // If the code already has a main function, return it as is
  if (userCode.includes("int main") || userCode.includes("void main")) {
    return userCode;
  }

  const hasClassSolution = /class\s+Solution\b/.test(userCode);
  const signatureMatch = userCode.match(
    /([A-Za-z_][\w:<>,\s&\*]*)\s+(\w+)\s*\(([^)]*)\)\s*\{/,
  );

  const returnType = signatureMatch ? signatureMatch[1].trim() : "int";
  const functionName = signatureMatch ? signatureMatch[2].trim() : "solve";
  const rawParams = signatureMatch
    ? signatureMatch[3].trim()
    : "vector<int> arr";

  const parsedParams = rawParams
    ? rawParams
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          const noDefault = p.split("=")[0].trim();
          const nameMatch = noDefault.match(/([A-Za-z_]\w*)$/);
          const name = nameMatch ? nameMatch[1] : "arg";
          const type = noDefault
            .slice(0, noDefault.length - name.length)
            .trim();
          return { type, name };
        })
    : [];

  const declarationLines: string[] = [];
  const callArgs: string[] = [];

  parsedParams.forEach((param) => {
    const keyExpr = `getInput(namedInputs, "${param.name}", unnamedInput)`;
    const normalizedType = param.type.toLowerCase();

    if (normalizedType.includes("vector")) {
      declarationLines.push(
        `    vector<int> ${param.name} = parseIntVector(${keyExpr});`,
      );
    } else if (normalizedType.includes("string")) {
      declarationLines.push(
        `    string ${param.name} = stripQuotes(${keyExpr});`,
      );
    } else {
      declarationLines.push(
        `    int ${param.name} = parseIntValue(${keyExpr});`,
      );
    }

    callArgs.push(param.name);
  });

  const firstVectorParam =
    parsedParams.find((p) => p.type.toLowerCase().includes("vector"))?.name ||
    "";
  const callExpr = hasClassSolution
    ? `solution.${functionName}(${callArgs.join(", ")})`
    : `${functionName}(${callArgs.join(", ")})`;

  let invocationBlock = "";
  if (returnType.toLowerCase().startsWith("void")) {
    invocationBlock = `
    ${callExpr};
    ${firstVectorParam ? `cout << formatVector(${firstVectorParam}) << endl;` : 'cout << "OK" << endl;'}`;
  } else if (returnType.toLowerCase().includes("vector")) {
    invocationBlock = `
    auto result = ${callExpr};
    cout << formatVector(result) << endl;`;
  } else {
    invocationBlock = `
    auto result = ${callExpr};
    cout << result << endl;`;
  }

  const wrappedCode = `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <unordered_map>
#include <regex>
#include <algorithm>
#include <cctype>
using namespace std;

${userCode}

string trim(const string& s) {
    size_t start = s.find_first_not_of(" \t\r\n");
    if (start == string::npos) return "";
    size_t end = s.find_last_not_of(" \t\r\n");
    return s.substr(start, end - start + 1);
}

string stripQuotes(const string& value) {
    string out = trim(value);
    if (!out.empty() && (out.front() == '\"' || out.front() == '\'')) out.erase(out.begin());
    if (!out.empty() && (out.back() == '\"' || out.back() == '\'')) out.pop_back();
    return trim(out);
}

unordered_map<string, string> parseNamedInputs(const string& input) {
    unordered_map<string, string> values;
    regex re("(\\\\w+)\\\\s*=\\\\s*(\\\\[[^\\\\]]*\\\\]|[^,\\\\n]+)");
    auto begin = sregex_iterator(input.begin(), input.end(), re);
    auto end = sregex_iterator();
    for (auto it = begin; it != end; ++it) {
        values[trim((*it)[1].str())] = trim((*it)[2].str());
    }
    return values;
}

string getInput(const unordered_map<string, string>& namedInputs, const string& key, const string& fallback) {
    auto it = namedInputs.find(key);
    if (it != namedInputs.end()) return it->second;
    return fallback;
}

int parseIntValue(const string& value) {
    string s = stripQuotes(value);
    string token;
    for (char c : s) {
        if (isdigit(static_cast<unsigned char>(c)) || c == '-') token.push_back(c);
    }
    if (token.empty() || token == "-") return 0;
    return stoi(token);
}

vector<int> parseIntVector(const string& value) {
    string s = stripQuotes(value);
    s.erase(remove(s.begin(), s.end(), '['), s.end());
    s.erase(remove(s.begin(), s.end(), ']'), s.end());
    s = trim(s);
    if (s.empty()) return {};

    vector<int> result;
    stringstream ss(s);
    string item;
    while (getline(ss, item, ',')) {
        item = trim(item);
        if (!item.empty()) result.push_back(stoi(item));
    }
    return result;
}

string formatVector(const vector<int>& arr) {
    string out = "[";
    for (size_t i = 0; i < arr.size(); ++i) {
        out += to_string(arr[i]);
        if (i + 1 < arr.size()) out += ",";
    }
    out += "]";
    return out;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string rawInput((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());
    string unnamedInput = trim(rawInput);
    auto namedInputs = parseNamedInputs(rawInput);

${declarationLines.join("\n")}

    ${hasClassSolution ? "Solution solution;" : ""}${invocationBlock}
    return 0;
}`;

  return wrappedCode;
}

// Helper function to execute code using OneCompiler API
async function executeCode(
  code: string,
  language: string,
  input: string,
  expectedOutput: string,
  apiKey: string,
  host: string,
): Promise<any> {
  const startTime = Date.now();

  // Wrap code with Main/boilerplate if needed
  let finalCode = code;
  if (language === "java") {
    finalCode = wrapJavaCode(code, input);
  } else if (language === "python") {
    finalCode = wrapPythonCode(code, input);
  } else if (language === "nodejs") {
    finalCode = wrapJavaScriptCode(code, input);
  } else if (language === "cpp") {
    finalCode = wrapCppCode(code, input);
  }

  // Submit the code for execution
  const submissionResponse = await fetch(`https://${host}/api/v1/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": host,
    },
    body: JSON.stringify({
      language: language,
      stdin: input,
      files: [
        {
          name: getFileName(language),
          content: finalCode,
        },
      ],
    }),
  });

  if (!submissionResponse.ok) {
    const errorText = await submissionResponse.text();
    throw new Error(
      `OneCompiler API error: ${submissionResponse.statusText} - ${errorText}`,
    );
  }

  const submissionData = await submissionResponse.json();
  const executionTime = ((Date.now() - startTime) / 1000).toFixed(3);

  // Check the status
  let status = "accepted";
  const actualOutput = (submissionData.stdout || "").trim();
  const expectedOutputTrimmed = expectedOutput.trim();

  const stripOuterQuotes = (value: string) => {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1).trim();
    }
    return trimmed;
  };

  const parseArrayLike = (value: string): number[] | null => {
    const raw = stripOuterQuotes(value).trim();
    if (!(raw.startsWith("[") && raw.endsWith("]"))) return null;

    const inner = raw.slice(1, -1).trim();
    if (!inner) return [];

    const parts = inner
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const nums = parts.map((p) => Number(p));
    return nums.every((n) => Number.isFinite(n)) ? nums : null;
  };

  const areOutputsEquivalent = (actual: string, expected: string) => {
    const a = stripOuterQuotes(actual).replace(/\r\n/g, "\n").trim();
    const e = stripOuterQuotes(expected).replace(/\r\n/g, "\n").trim();

    if (a === e) return true;

    const aArray = parseArrayLike(a);
    const eArray = parseArrayLike(e);
    if (aArray && eArray) {
      if (aArray.length !== eArray.length) return false;
      return aArray.every((val, idx) => val === eArray[idx]);
    }

    const aNum = Number(a);
    const eNum = Number(e);
    if (Number.isFinite(aNum) && Number.isFinite(eNum)) {
      return aNum === eNum;
    }

    // Fallback: ignore insignificant whitespace differences.
    return a.replace(/\s+/g, "") === e.replace(/\s+/g, "");
  };

  const passed = areOutputsEquivalent(actualOutput, expectedOutputTrimmed);

  // Determine status based on response
  if (submissionData.stderr && submissionData.stderr.trim()) {
    // Check if it's a compilation error or runtime error
    if (
      submissionData.stderr.includes("error:") ||
      submissionData.stderr.includes("Error:") ||
      submissionData.stderr.includes("SyntaxError") ||
      submissionData.stderr.includes("compilation")
    ) {
      status = "compilation_error";
    } else {
      status = "runtime_error";
    }
  } else if (!passed && actualOutput) {
    status = "wrong_answer";
  } else if (!actualOutput && !submissionData.stderr) {
    status = "runtime_error";
  }

  return {
    input,
    expectedOutput: expectedOutputTrimmed,
    actualOutput,
    passed,
    status,
    executionTime: executionTime,
    memory: "N/A", // OneCompiler doesn't provide memory info
    stderr: submissionData.stderr || "",
    compileOutput: submissionData.stderr || "",
  };
}

// Helper function to get appropriate file name for language
function getFileName(language: string): string {
  const fileNames: { [key: string]: string } = {
    python: "main.py",
    nodejs: "index.js",
    javascript: "index.js",
    java: "Main.java",
    cpp: "main.cpp",
    c: "main.c",
    typescript: "index.ts",
    go: "main.go",
    rust: "main.rs",
  };
  return fileNames[language] || "main.txt";
}

// Helper function to update user progress
async function updateUserProgress(userId: string, difficulty: string) {
  const [progress] = await db
    .select()
    .from(UserDsaProgressTable)
    .where(eq(UserDsaProgressTable.userId, userId))
    .limit(1);

  if (!progress) return;

  const updates: any = {
    totalQuestionsSolved: (progress.totalQuestionsSolved || 0) + 1,
    lastActivityDate: new Date().toISOString(),
  };

  if (difficulty === "easy") {
    updates.easyQuestionsSolved = (progress.easyQuestionsSolved || 0) + 1;
  } else if (difficulty === "medium") {
    updates.mediumQuestionsSolved = (progress.mediumQuestionsSolved || 0) + 1;
  } else if (difficulty === "hard") {
    updates.hardQuestionsSolved = (progress.hardQuestionsSolved || 0) + 1;
  }

  // Update skill level based on questions solved
  const totalSolved = updates.totalQuestionsSolved;
  if (totalSolved < 10) {
    updates.skillLevel = "beginner";
  } else if (totalSolved < 50) {
    updates.skillLevel = "intermediate";
  } else if (totalSolved < 100) {
    updates.skillLevel = "advanced";
  } else {
    updates.skillLevel = "expert";
  }

  await db
    .update(UserDsaProgressTable)
    .set(updates)
    .where(eq(UserDsaProgressTable.userId, userId));
}
