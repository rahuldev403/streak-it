import { db } from "@/app/config/db";
import {
  ChapterContentTable,
  CourseChapterTable,
  CourseTable,
} from "@/app/config/schema";
import { isAdmin } from "@/lib/admin";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type WebDevQuestionType =
  | "html-css-js"
  | "react"
  | "nextjs"
  | "nodejs"
  | "typescript";

const WEB_DEV_TYPES: WebDevQuestionType[] = [
  "html-css-js",
  "react",
  "nextjs",
  "nodejs",
  "typescript",
];

interface DraftFile {
  name: string;
  content: string;
  language: string;
  readonly: boolean;
}

interface DraftTestCase {
  id: string;
  input?: string;
  expectedOutput: string;
  description: string;
}

interface PublishRequest {
  courseId: string;
  chapterId: number;
  questionType: WebDevQuestionType;
  overwriteExisting?: boolean;
  draft: {
    title: string;
    problemStatement: string;
    instructions: string;
    expectedOutput: string;
    hints?: string;
    solutionCode: string;
    boilerplateFiles: DraftFile[];
    testCases: DraftTestCase[];
  };
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

    const body = (await req.json()) as PublishRequest;
    const courseId = String(body.courseId || "")
      .trim()
      .toLowerCase();
    const chapterId = Number(body.chapterId);
    const questionType = body.questionType;
    const overwriteExisting = body.overwriteExisting !== false;

    if (
      !courseId ||
      !Number.isFinite(chapterId) ||
      !questionType ||
      !body.draft
    ) {
      return NextResponse.json(
        { error: "courseId, chapterId, questionType and draft are required" },
        { status: 400 },
      );
    }

    if (!WEB_DEV_TYPES.includes(questionType)) {
      return NextResponse.json(
        { error: "Invalid questionType for web-development exercise" },
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
            "This publish flow is for web-development tracks only (DSA/CS fundamentals excluded).",
        },
        { status: 400 },
      );
    }

    const chapterMatch = await db
      .select({ id: CourseChapterTable.id })
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

    const normalized = normalizeDraft(body.draft);
    if (!normalized.valid) {
      return NextResponse.json({ error: normalized.error }, { status: 422 });
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
        title: normalized.data.title,
        problemStatement: normalized.data.problemStatement,
        instructions: normalized.data.instructions,
        expectedOutput: normalized.data.expectedOutput,
        hints: normalized.data.hints,
        questionType,
        boilerplateFiles: JSON.stringify(normalized.data.boilerplateFiles),
        testCases: JSON.stringify(normalized.data.testCases),
        solutionCode: normalized.data.solutionCode,
        order: 0,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Draft published to chapter successfully",
      content: {
        ...inserted,
        boilerplateFiles: JSON.parse(inserted.boilerplateFiles),
        testCases: JSON.parse(inserted.testCases),
      },
    });
  } catch (error) {
    console.error("Error publishing web-dev chapter exercise:", error);
    return NextResponse.json(
      {
        error: "Failed to publish web-development chapter exercise",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function normalizeDraft(draft: PublishRequest["draft"]):
  | {
      valid: true;
      data: {
        title: string;
        problemStatement: string;
        instructions: string;
        expectedOutput: string;
        hints: string | null;
        solutionCode: string;
        boilerplateFiles: DraftFile[];
        testCases: DraftTestCase[];
      };
    }
  | { valid: false; error: string } {
  const title = String(draft?.title || "").trim();
  const problemStatement = String(draft?.problemStatement || "").trim();
  const instructions = String(draft?.instructions || "").trim();
  const expectedOutput = String(draft?.expectedOutput || "").trim();
  const hints = draft?.hints ? String(draft.hints).trim() : null;
  const solutionCode = String(draft?.solutionCode || "").trim();

  if (
    !title ||
    !problemStatement ||
    !instructions ||
    !expectedOutput ||
    !solutionCode
  ) {
    return {
      valid: false,
      error: "Draft is missing required fields",
    };
  }

  if (
    !Array.isArray(draft?.boilerplateFiles) ||
    draft.boilerplateFiles.length === 0
  ) {
    return {
      valid: false,
      error: "Draft must include boilerplate files",
    };
  }

  if (!Array.isArray(draft?.testCases) || draft.testCases.length === 0) {
    return {
      valid: false,
      error: "Draft must include test cases",
    };
  }

  const boilerplateFiles = draft.boilerplateFiles.map((file, index) => ({
    name: String(file?.name || `file-${index + 1}.txt`).trim(),
    content: String(file?.content || ""),
    language: String(file?.language || "javascript").trim(),
    readonly: Boolean(file?.readonly),
  }));

  const hasInvalidFile = boilerplateFiles.some(
    (file) => !file.name || !file.language,
  );
  if (hasInvalidFile) {
    return {
      valid: false,
      error: "Every boilerplate file needs name and language",
    };
  }

  const testCases = draft.testCases.map((testCase, index) => ({
    id: String(testCase?.id || `tc-${index + 1}`).trim(),
    input: testCase?.input ? String(testCase.input) : undefined,
    expectedOutput: String(testCase?.expectedOutput || "").trim(),
    description: String(testCase?.description || "").trim(),
  }));

  const hasInvalidTestCase = testCases.some(
    (testCase) =>
      !testCase.id || !testCase.expectedOutput || !testCase.description,
  );
  if (hasInvalidTestCase) {
    return {
      valid: false,
      error: "Every test case needs id, expectedOutput and description",
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
      solutionCode,
      boilerplateFiles,
      testCases,
    },
  };
}
