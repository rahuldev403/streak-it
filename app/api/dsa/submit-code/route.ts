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

  // Parse the input to create proper test case call
  const inputLines = input.trim().split("\n");
  const inputData = inputLines[0]; // First line is usually the array or data

  // Detect the method signature from the Solution class
  const methodMatch = userCode.match(/public\s+\w+\s+(\w+)\s*\([^)]*\)/);
  const methodName = methodMatch ? methodMatch[1] : "solve";

  // Detect return type
  const returnTypeMatch = userCode.match(/public\s+(\w+)\s+\w+\s*\([^)]*\)/);
  const returnType = returnTypeMatch ? returnTypeMatch[1] : "int";

  // Detect parameter type (int[], String, etc.)
  const paramMatch = userCode.match(/public\s+\w+\s+\w+\s*\(([^)]*)\)/);
  const paramType = paramMatch ? paramMatch[1].split(" ")[0] : "int[]";

  // Generate appropriate input parsing and method call based on parameter type
  let inputParsing = "";
  let methodCall = "";

  if (paramType.includes("int[]")) {
    inputParsing = `
        // Clean input: remove brackets, "arr =", etc.
        String cleanInput = input.replaceAll("\\\\[|\\\\]|arr\\\\s*=\\\\s*", "").trim();
        String[] parts = cleanInput.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Integer.parseInt(parts[i].trim());
        }`;
    methodCall = `solution.${methodName}(arr)`;
  } else if (paramType === "int") {
    inputParsing = `
        String cleanInput = input.replaceAll("\\\\[|\\\\]|arr\\\\s*=\\\\s*|n\\\\s*=\\\\s*|num\\\\s*=\\\\s*", "").trim();
        int num = Integer.parseInt(cleanInput);`;
    methodCall = `solution.${methodName}(num)`;
  } else if (paramType === "String") {
    inputParsing = `
        String str = input.replaceAll("\\\"", "").trim();`;
    methodCall = `solution.${methodName}(str)`;
  } else {
    // Default to int[]
    inputParsing = `
        // Clean input: remove brackets, "arr =", etc.
        String cleanInput = input.replaceAll("\\\\[|\\\\]|arr\\\\s*=\\\\s*", "").trim();
        String[] parts = cleanInput.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Integer.parseInt(parts[i].trim());
        }`;
    methodCall = `solution.${methodName}(arr)`;
  }

  const wrappedCode = `
import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        scanner.close();
        ${inputParsing}
        
        Solution solution = new Solution();
        ${returnType} result = ${methodCall};
        System.out.println(result);
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

  // Detect the function signature
  const functionMatch = userCode.match(/def\s+(\w+)\s*\([^)]*\)/);
  const functionName = functionMatch ? functionMatch[1] : "solve";

  // Detect parameter type from function signature
  const paramMatch = userCode.match(/def\s+\w+\s*\(([^)]*)\)/);
  const params = paramMatch ? paramMatch[1].split(":")[0].trim() : "arr";

  let inputParsing = "";
  let functionCall = "";

  // Check if parameter suggests list/array type
  if (
    params.includes("arr") ||
    params.includes("list") ||
    params.includes("nums")
  ) {
    inputParsing = `
import re
input_line = input().strip()
# Clean input: remove brackets, "arr =", etc.
clean_input = re.sub(r'\\[|\\]|arr\\s*=\\s*', '', input_line).strip()
arr = list(map(int, clean_input.split(',')))`;
    functionCall = `${functionName}(arr)`;
  } else if (params.includes("s") || params.includes("str")) {
    inputParsing = `
input_line = input().strip()`;
    functionCall = `${functionName}(input_line)`;
  } else {
    inputParsing = `
import re
input_line = input().strip()
# Clean input: remove brackets, prefixes like "n ="
clean_input = re.sub(r'\\[|\\]|n\\s*=\\s*|num\\s*=\\s*', '', input_line).strip()
num = int(clean_input)`;
    functionCall = `${functionName}(num)`;
  }

  const wrappedCode = `${userCode}

${inputParsing}
result = ${functionCall}
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

  // Detect the function signature
  const functionMatch = userCode.match(
    /(?:function|const|let|var)\s+(\w+)\s*[=\(]/,
  );
  const functionName = functionMatch ? functionMatch[1] : "solve";

  // Detect parameter type
  const paramMatch = userCode.match(
    /(?:function|const|let|var)\s+\w+\s*[=]?\s*\(([^)]*)\)/,
  );
  const params = paramMatch ? paramMatch[1].trim() : "arr";

  let inputParsing = "";
  let functionCall = "";

  // Check if parameter suggests array type
  if (
    params.includes("arr") ||
    params.includes("array") ||
    params.includes("nums")
  ) {
    inputParsing = `// Clean input: remove brackets, "arr =", etc.
const cleanInput = input.trim().replace(/\\[|\\]|arr\\s*=\\s*/g, '').trim();
const arr = cleanInput.split(',').map(x => parseInt(x.trim()));`;
    functionCall = `${functionName}(arr)`;
  } else if (params.includes("s") || params.includes("str")) {
    inputParsing = `const str = input.trim().replace(/"/g, '');`;
    functionCall = `${functionName}(str)`;
  } else {
    inputParsing = `// Clean input: remove brackets, prefixes
const cleanInput = input.trim().replace(/\\[|\\]|n\\s*=\\s*|num\\s*=\\s*/g, '').trim();
const num = parseInt(cleanInput);`;
    functionCall = `${functionName}(num)`;
  }
const cleanInput = input.trim().replace(/\\[|\\]|n\\s*=\\s*|num\\s*=\\s*/g, '').trim();
const num = parseInt(cleanInput);`;
    functionCall = `${functionName}(num)`;
  }

  const wrappedCode = `${userCode}

const input = require('fs').readFileSync(0, 'utf-8');
${inputParsing}
const result = ${functionCall};
console.log(result);`;

  return wrappedCode;
}

// Helper function to wrap C++ code with main function
function wrapCppCode(userCode: string, input: string): string {
  // If the code already has a main function, return it as is
  if (userCode.includes("int main") || userCode.includes("void main")) {
    return userCode;
  }

  // Detect the function signature
  const functionMatch = userCode.match(
    /(?:int|void|string|bool|double|float)\s+(\w+)\s*\([^)]*\)/,
  );
  const functionName = functionMatch ? functionMatch[1] : "solve";

  // Detect return type
  const returnTypeMatch = userCode.match(
    /(?:int|void|string|bool|double|float)\s+\w+\s*\([^)]*\)/,
  );
  const returnType = returnTypeMatch ? returnTypeMatch[0].split(" ")[0] : "int";

  // Detect parameter type
  const paramMatch = userCode.match(/\w+\s+\w+\s*\(([^)]*)\)/);
  const params = paramMatch ? paramMatch[1] : "vector<int> arr";

  let inputParsing = "";
  let functionCall = "";

  // Check if parameter suggests vector/array type
  if (
    params.includes("vector") ||
    params.includes("arr") ||
    params.includes("array")
  ) {
    inputParsing = `
    string line;
    getline(cin, line);
    // Clean input: remove brackets, "arr =", etc.
    line.erase(remove(line.begin(), line.end(), '['), line.end());
    line.erase(remove(line.begin(), line.end(), ']'), line.end());
    size_t pos = line.find("arr");
    if (pos != string::npos) {
        line = line.substr(pos + 3);
        pos = line.find("=");
        if (pos != string::npos) line = line.substr(pos + 1);
    }
    vector<int> arr;
    stringstream ss(line);
    string item;
    while (getline(ss, item, ',')) {
        arr.push_back(stoi(item));
    }`;
    functionCall = `${functionName}(arr)`;
  } else if (params.includes("string")) {
    inputParsing = `
    string str;
    getline(cin, str);
    // Remove quotes if present
    str.erase(remove(str.begin(), str.end(), '"'), str.end());`;
    functionCall = `${functionName}(str)`;
  } else {
    inputParsing = `
    string line;
    getline(cin, line);
    // Clean input: remove brackets, prefixes
    line.erase(remove(line.begin(), line.end(), '['), line.end());
    line.erase(remove(line.begin(), line.end(), ']'), line.end());
    size_t pos = line.find("=");
    if (pos != string::npos) line = line.substr(pos + 1);
    int num = stoi(line);`;
    functionCall = `${functionName}(num)`;
  }
    size_t pos = line.find("=");
    if (pos != string::npos) line = line.substr(pos + 1);
    int num = stoi(line);`;
    functionCall = `${functionName}(num)`;
  }

  const wrappedCode = `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

${userCode}

int main() {
    ${inputParsing}
    ${returnType} result = ${functionCall};
    cout << result << endl;
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
  const passed = actualOutput === expectedOutputTrimmed;

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
