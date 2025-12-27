import { NextRequest, NextResponse } from "next/server";

const MISTRAL_API_KEY = "zFXYgKOUKnw2A3oL5D26c81wukCXNzCn";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

interface TestCase {
  id: string;
  input?: string;
  expectedOutput: string;
  description: string;
}

interface ValidationRequest {
  code: Record<string, string>; // fileName -> code content
  testCases: TestCase[];
  questionType: string;
  problemStatement: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json();
    const { code, testCases, questionType, problemStatement } = body;

    if (!code || !testCases || testCases.length === 0) {
      return NextResponse.json(
        { error: "Code and test cases are required" },
        { status: 400 }
      );
    }

    // Prepare the code content as a string
    const codeContent = Object.entries(code)
      .map(([fileName, content]) => `// File: ${fileName}\n${content}`)
      .join("\n\n");

    // Validate each test case
    const validationResults = await Promise.all(
      testCases.map(async (testCase) => {
        const prompt = `You are a code validator. Analyze the following code and determine if it satisfies the test case requirements.

Problem Statement:
${problemStatement}

Question Type: ${questionType}

Code:
${codeContent}

Test Case:
Description: ${testCase.description}
${testCase.input ? `Input: ${testCase.input}` : ""}
Expected Output: ${testCase.expectedOutput}

Analyze whether the code correctly implements the logic to produce the expected output for this test case.

IMPORTANT: Respond with ONLY "true" or "false" (lowercase, no quotes, no explanation).
- Return "true" if the code correctly handles this test case
- Return "false" if the code does not correctly handle this test case`;

        try {
          const response = await fetch(MISTRAL_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${MISTRAL_API_KEY}`,
            },
            body: JSON.stringify({
              model: "mistral-large-latest",
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.1, // Low temperature for consistent results
              max_tokens: 10,
            }),
          });

          if (!response.ok) {
            console.error("Mistral API error:", await response.text());
            return {
              testCaseId: testCase.id,
              passed: false,
              error: "API validation failed",
            };
          }

          const data = await response.json();
          const result = data.choices[0]?.message?.content
            ?.trim()
            .toLowerCase();

          return {
            testCaseId: testCase.id,
            description: testCase.description,
            expectedOutput: testCase.expectedOutput,
            passed: result === "true",
          };
        } catch (error) {
          console.error(`Error validating test case ${testCase.id}:`, error);
          return {
            testCaseId: testCase.id,
            description: testCase.description,
            passed: false,
            error: "Validation error",
          };
        }
      })
    );

    // Check if all test cases passed
    const allPassed = validationResults.every((result) => result.passed);
    const passedCount = validationResults.filter((r) => r.passed).length;
    const totalCount = validationResults.length;

    return NextResponse.json({
      success: true,
      allPassed,
      passedCount,
      totalCount,
      results: validationResults,
    });
  } catch (error) {
    console.error("Error in validate-code API:", error);
    return NextResponse.json(
      { error: "Failed to validate code" },
      { status: 500 }
    );
  }
}
