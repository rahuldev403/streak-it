import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { DsaSubmissionTable, DsaQuestionTable, UserDsaProgressTable } from "@/app/config/schema";
import { eq, and } from "drizzle-orm";

// Judge0 Language IDs
const LANGUAGE_IDS: { [key: string]: number } = {
  python: 71, // Python 3
  javascript: 63, // JavaScript (Node.js)
  java: 62, // Java
  cpp: 54, // C++ (GCC 9.2.0)
  c: 50, // C (GCC 9.2.0)
  typescript: 74, // TypeScript
  go: 60, // Go
  rust: 73, // Rust
};

export async function POST(req: NextRequest) {
  try {
    const { userId, questionId, code, language } = await req.json();

    if (!userId || !questionId || !code || !language) {
      return NextResponse.json(
        { error: "Missing required fields: userId, questionId, code, language" },
        { status: 400 }
      );
    }

    const judge0ApiKey = process.env.JUDGE0_API_KEY;
    const judge0Host = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

    if (!judge0ApiKey) {
      return NextResponse.json(
        { error: "Judge0 API key not configured" },
        { status: 500 }
      );
    }

    // Get the question details
    const [question] = await db
      .select()
      .from(DsaQuestionTable)
      .where(
        and(
          eq(DsaQuestionTable.id, questionId),
          eq(DsaQuestionTable.userId, userId)
        )
      )
      .limit(1);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found or doesn't belong to this user" },
        { status: 404 }
      );
    }

    // Parse test cases
    const testCases = JSON.parse(question.testCases);

    // Run code against all test cases
    const results = await runTestCases(
      code,
      language,
      testCases,
      judge0ApiKey,
      judge0Host
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
      { status: 500 }
    );
  }
}

// Helper function to run all test cases
async function runTestCases(
  code: string,
  language: string,
  testCases: any[],
  apiKey: string,
  host: string
): Promise<any[]> {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];

  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const results = [];

  for (const testCase of testCases) {
    try {
      const result = await executeCode(
        code,
        languageId,
        testCase.input,
        testCase.expectedOutput,
        apiKey,
        host
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

// Helper function to execute code using Judge0
async function executeCode(
  code: string,
  languageId: number,
  input: string,
  expectedOutput: string,
  apiKey: string,
  host: string
): Promise<any> {
  // Submit the code for execution
  const submissionResponse = await fetch(
    `https://${host}/submissions?base64_encoded=false&wait=true`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": host,
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: input,
        expected_output: expectedOutput,
      }),
    }
  );

  if (!submissionResponse.ok) {
    throw new Error(`Judge0 API error: ${submissionResponse.statusText}`);
  }

  const submissionData = await submissionResponse.json();

  // Check the status
  let status = "accepted";
  const actualOutput = (submissionData.stdout || "").trim();
  const expectedOutputTrimmed = expectedOutput.trim();
  const passed = actualOutput === expectedOutputTrimmed;

  if (submissionData.status.id === 3) {
    // Accepted
    status = passed ? "accepted" : "wrong_answer";
  } else if (submissionData.status.id === 6) {
    // Compilation Error
    status = "compilation_error";
  } else if (submissionData.status.id === 11 || submissionData.status.id === 12) {
    // Runtime Error
    status = "runtime_error";
  } else if (submissionData.status.id === 5) {
    // Time Limit Exceeded
    status = "time_limit_exceeded";
  } else {
    status = "error";
  }

  return {
    input,
    expectedOutput: expectedOutputTrimmed,
    actualOutput,
    passed,
    status,
    executionTime: submissionData.time || "0",
    memory: submissionData.memory || "0",
    stderr: submissionData.stderr || "",
    compileOutput: submissionData.compile_output || "",
  };
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
    totalQuestionsSolved: progress.totalQuestionsSolved + 1,
    lastActivityDate: new Date().toISOString(),
  };

  if (difficulty === "easy") {
    updates.easyQuestionsSolved = progress.easyQuestionsSolved + 1;
  } else if (difficulty === "medium") {
    updates.mediumQuestionsSolved = progress.mediumQuestionsSolved + 1;
  } else if (difficulty === "hard") {
    updates.hardQuestionsSolved = progress.hardQuestionsSolved + 1;
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
