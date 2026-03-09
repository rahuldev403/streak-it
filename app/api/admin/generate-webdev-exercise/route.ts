import { db } from "@/app/config/db";
import {
  ChapterContentTable,
  CourseChapterTable,
  CourseTable,
} from "@/app/config/schema";
import { isAdmin } from "@/lib/admin";
import { ProviderMode, resolveGeminiApiKey } from "@/lib/gemini-provider";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type WebDevQuestionType =
  | "html-css-js"
  | "react"
  | "nextjs"
  | "nodejs"
  | "typescript";

type Difficulty = "beginner" | "intermediate" | "advanced";

const WEB_DEV_TYPES: WebDevQuestionType[] = [
  "html-css-js",
  "react",
  "nextjs",
  "nodejs",
  "typescript",
];

const DIFFICULTY_LEVELS: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

interface GenerationRequest {
  courseId: string;
  chapterId: number;
  concept: string;
  questionType: WebDevQuestionType;
  difficulty: Difficulty;
  learningGoal?: string;
  brokenFocus?: string;
  providerMode?: ProviderMode;
  overwriteExisting?: boolean;
  draftOnly?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!isAdmin(userEmail)) {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 },
      );
    }

    const body = (await req.json()) as GenerationRequest;

    const courseId = (body.courseId || "").trim().toLowerCase();
    const chapterId = Number(body.chapterId);
    const concept = (body.concept || "").trim();
    const learningGoal = (body.learningGoal || "").trim();
    const brokenFocus = (body.brokenFocus || "").trim();
    const difficulty = body.difficulty;
    const questionType = body.questionType;
    const overwriteExisting = Boolean(body.overwriteExisting);
    const draftOnly = Boolean(body.draftOnly);

    if (!courseId || !Number.isFinite(chapterId) || !concept) {
      return NextResponse.json(
        { error: "courseId, chapterId and concept are required" },
        { status: 400 },
      );
    }

    if (!WEB_DEV_TYPES.includes(questionType)) {
      return NextResponse.json(
        { error: "Invalid questionType for web-development exercise" },
        { status: 400 },
      );
    }

    if (!DIFFICULTY_LEVELS.includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 },
      );
    }

    const courseMatch = await db
      .select({ id: CourseTable.id, tags: CourseTable.tags })
      .from(CourseTable)
      .where(eq(CourseTable.courseId, courseId))
      .limit(1);

    if (courseMatch.length === 0) {
      return NextResponse.json(
        {
          error: "Course not found",
        },
        { status: 404 },
      );
    }

    const courseTags = (courseMatch[0].tags || "").toLowerCase();
    if (
      courseTags.includes("subject:dsa") ||
      courseTags.includes("subject:cs-fundamentals")
    ) {
      return NextResponse.json(
        {
          error:
            "This generator is for web-development tracks only (DSA/CS fundamentals excluded).",
        },
        { status: 400 },
      );
    }

    const chapterMatch = await db
      .select({ id: CourseChapterTable.id, name: CourseChapterTable.name })
      .from(CourseChapterTable)
      .where(
        and(
          eq(CourseChapterTable.id, chapterId),
          eq(CourseChapterTable.courseId, courseId),
        ),
      )
      .limit(1);

    if (chapterMatch.length === 0) {
      return NextResponse.json(
        { error: "Chapter not found for the provided course" },
        { status: 404 },
      );
    }

    const provider = await resolveGeminiApiKey(
      user.id,
      body.providerMode as ProviderMode | undefined,
    );
    if (!provider.success || !provider.apiKey) {
      return NextResponse.json(
        { error: provider.message || "AI provider is not available" },
        { status: provider.status || 500 },
      );
    }

    const openai = new OpenAI({
      apiKey: provider.apiKey,
      baseURL:
        process.env.GEMINI_BASE_URL ||
        "https://generativelanguage.googleapis.com/v1beta/openai",
    });

    const completion = await openai.chat.completions.create({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You generate web-development coding exercises for a fix-the-broken-code learning platform. Return strict JSON only.",
        },
        {
          role: "user",
          content: buildPrompt({
            chapterName: chapterMatch[0].name,
            concept,
            difficulty,
            learningGoal,
            brokenFocus,
            questionType,
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json(
        { error: "No response from AI model" },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(rawContent);
    const validated = normalizeGeneratedPayload(parsed, questionType);

    if (!validated.valid) {
      return NextResponse.json(
        { error: validated.error || "Invalid generated payload" },
        { status: 422 },
      );
    }

    if (draftOnly) {
      return NextResponse.json({
        success: true,
        message: "Draft exercise generated. Review and publish when ready.",
        draft: {
          chapterId,
          questionType,
          ...validated.data,
        },
      });
    }

    if (overwriteExisting) {
      await db
        .delete(ChapterContentTable)
        .where(eq(ChapterContentTable.chapterId, chapterId));
    }

    const [inserted] = await db
      .insert(ChapterContentTable)
      .values({
        chapterId,
        title: validated.data.title,
        problemStatement: validated.data.problemStatement,
        instructions: validated.data.instructions,
        expectedOutput: validated.data.expectedOutput,
        hints: validated.data.hints,
        questionType,
        boilerplateFiles: JSON.stringify(validated.data.boilerplateFiles),
        testCases: JSON.stringify(validated.data.testCases),
        solutionCode: validated.data.solutionCode,
        order: 0,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Web-development chapter exercise generated successfully",
      content: {
        ...inserted,
        boilerplateFiles: JSON.parse(inserted.boilerplateFiles),
        testCases: JSON.parse(inserted.testCases),
      },
      draft: {
        chapterId,
        questionType,
        ...validated.data,
      },
    });
  } catch (error) {
    console.error("Error generating web-dev chapter exercise:", error);
    return NextResponse.json(
      {
        error: "Failed to generate web-development chapter exercise",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function buildPrompt(params: {
  chapterName: string;
  concept: string;
  difficulty: Difficulty;
  questionType: WebDevQuestionType;
  learningGoal?: string;
  brokenFocus?: string;
}) {
  const stackHint: Record<WebDevQuestionType, string> = {
    "html-css-js": "Use index.html, style.css, and script.js files.",
    react:
      "Use component-based React files (App.jsx or App.tsx and related files).",
    nextjs:
      "Use a small Next.js app-router style example (page.tsx plus helper files if needed).",
    nodejs:
      "Use Node.js + Express style API files such as server.js/app.js and route handlers.",
    typescript: "Use TypeScript files with type-safe interfaces and functions.",
  };

  return `Create ONE web-development fix-the-broken-code exercise in strict JSON.

Context:
- Chapter: ${params.chapterName}
- Concept: ${params.concept}
- Difficulty: ${params.difficulty}
- Track: ${params.questionType}
- Learning Goal: ${params.learningGoal || "Teach practical debugging and concept application"}
- Broken Focus: ${params.brokenFocus || "Logic and syntax mistakes relevant to the concept"}

Rules:
- Exercise must be practical and realistic for web development.
- Provide intentionally broken starter code that students must fix.
- Keep scope small enough for a 15-30 minute chapter task.
- Include at least 3 files for html-css-js, and at least 2 files for other tracks.
- Include 3 to 5 test cases that can evaluate correctness.
- Use beginner-friendly language but keep code professional.
- ${stackHint[params.questionType]}

Return JSON with this exact structure:
{
  "title": "string (max 80 chars)",
  "problemStatement": "markdown string",
  "instructions": "markdown bullet list",
  "expectedOutput": "markdown string",
  "hints": "markdown string with 3 hints",
  "boilerplateFiles": [
    {
      "name": "string",
      "content": "string",
      "language": "html | css | javascript | typescript | jsx | tsx | json",
      "readonly": false
    }
  ],
  "testCases": [
    {
      "id": "tc-1",
      "input": "optional string",
      "expectedOutput": "string",
      "description": "string"
    }
  ],
  "solutionCode": "string with complete corrected solution across files"
}`;
}

function normalizeGeneratedPayload(
  payload: any,
  questionType: WebDevQuestionType,
):
  | {
      valid: true;
      data: {
        title: string;
        problemStatement: string;
        instructions: string;
        expectedOutput: string;
        hints: string;
        boilerplateFiles: Array<{
          name: string;
          content: string;
          language: string;
          readonly: boolean;
        }>;
        testCases: Array<{
          id: string;
          input?: string;
          expectedOutput: string;
          description: string;
        }>;
        solutionCode: string;
      };
    }
  | { valid: false; error: string } {
  const title = String(payload?.title || "").trim();
  const problemStatement = String(payload?.problemStatement || "").trim();
  const instructions = String(payload?.instructions || "").trim();
  const expectedOutput = String(payload?.expectedOutput || "").trim();
  const hints = String(payload?.hints || "").trim();
  const solutionCode = String(payload?.solutionCode || "").trim();

  if (
    !title ||
    !problemStatement ||
    !instructions ||
    !expectedOutput ||
    !solutionCode
  ) {
    return {
      valid: false,
      error: "AI response is missing required exercise text fields",
    };
  }

  if (title.length > 255) {
    return {
      valid: false,
      error: "Generated title exceeds DB limits",
    };
  }

  if (
    !Array.isArray(payload?.boilerplateFiles) ||
    payload.boilerplateFiles.length < 2
  ) {
    return {
      valid: false,
      error: "boilerplateFiles must contain at least 2 files",
    };
  }

  if (questionType === "html-css-js" && payload.boilerplateFiles.length < 3) {
    return {
      valid: false,
      error: "html-css-js exercises must contain at least 3 files",
    };
  }

  const boilerplateFiles = payload.boilerplateFiles.map(
    (file: any, index: number) => ({
      name: String(file?.name || `file-${index + 1}.txt`).trim(),
      content: String(file?.content || ""),
      language: String(file?.language || "javascript").trim(),
      readonly: Boolean(file?.readonly),
    }),
  );

  const hasInvalidFile = boilerplateFiles.some(
    (file: { name: string; language: string }) => !file.name || !file.language,
  );
  if (hasInvalidFile) {
    return {
      valid: false,
      error: "Each boilerplate file must include name and language",
    };
  }

  if (!Array.isArray(payload?.testCases) || payload.testCases.length < 3) {
    return {
      valid: false,
      error: "testCases must contain at least 3 checks",
    };
  }

  const testCases = payload.testCases
    .slice(0, 5)
    .map((test: any, index: number) => ({
      id: String(test?.id || `tc-${index + 1}`),
      input: test?.input ? String(test.input) : undefined,
      expectedOutput: String(test?.expectedOutput || "").trim(),
      description: String(test?.description || "").trim(),
    }));

  const hasInvalidTest = testCases.some(
    (test: { id: string; expectedOutput: string; description: string }) =>
      !test.id || !test.expectedOutput || !test.description,
  );

  if (hasInvalidTest) {
    return {
      valid: false,
      error: "Each test case must include id, expectedOutput and description",
    };
  }

  return {
    valid: true,
    data: {
      title,
      problemStatement,
      instructions,
      expectedOutput,
      hints,
      boilerplateFiles,
      testCases,
      solutionCode,
    },
  };
}
