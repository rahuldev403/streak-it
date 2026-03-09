import { db } from "@/app/config/db";
import {
  ChapterContentTable,
  CourseChapterTable,
  CourseTable,
} from "@/app/config/schema";
import { hasAdminAccess } from "@/lib/admin";
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

interface ImportCoursePayload {
  courseId: string;
  title: string;
  description: string;
  bannerImage?: string;
  level?: string;
  tags?: string;
}

interface ImportChapterPayload {
  name: string;
  desc: string;
  exercise?: string;
}

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

interface ExerciseDraft {
  title: string;
  problemStatement: string;
  instructions: string;
  expectedOutput: string;
  hints?: string;
  solutionCode: string;
  boilerplateFiles: DraftFile[];
  testCases: DraftTestCase[];
}

interface ImportExercisePayload {
  chapterName: string;
  questionType: WebDevQuestionType;
  draft: ExerciseDraft;
}

interface ImportPayload {
  course: ImportCoursePayload;
  chapters: ImportChapterPayload[];
  chapterExercises: ImportExercisePayload[];
  overwriteExisting?: boolean;
}

interface ContentOnlyImportPayload {
  courseId: string;
  chapterId?: number;
  chapterName?: string;
  questionType: WebDevQuestionType;
  draft: ExerciseDraft;
  drafts?: Array<ExerciseDraft | BulkDraftWithType>;
  overwriteExisting?: boolean;
}

interface ChapterPackagePayload {
  chapter?: {
    name?: string;
    desc?: string;
    description?: string;
    exercise?: string;
    exerciseIntent?: string;
  };
  name?: string;
  desc?: string;
  description?: string;
  exercise?: string;
  exerciseIntent?: string;
  questionType?: WebDevQuestionType;
  draft?: ExerciseDraft;
  drafts?: Array<ExerciseDraft | BulkDraftWithType>;
}

interface ChapterPackagesImportPayload {
  courseId: string;
  questionType?: WebDevQuestionType;
  chapterPackages: ChapterPackagePayload[];
  overwriteExisting?: boolean;
}

interface BulkDraftWithType {
  questionType?: WebDevQuestionType;
  draft?: ExerciseDraft;
  title?: string;
  problemStatement?: string;
  instructions?: string;
  expectedOutput?: string;
  hints?: string;
  solutionCode?: string;
  boilerplateFiles?: DraftFile[];
  testCases?: DraftTestCase[];
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!hasAdminAccess(userEmail, user.publicMetadata?.isAdmin)) {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 },
      );
    }

    const rawBody = (await req.json()) as
      | ImportPayload
      | ContentOnlyImportPayload;

    const isFullPackagePayload =
      typeof (rawBody as ImportPayload)?.course === "object" &&
      Array.isArray((rawBody as ImportPayload)?.chapters) &&
      Array.isArray((rawBody as ImportPayload)?.chapterExercises);

    if (!isFullPackagePayload) {
      return importExistingChapterContent(rawBody as ContentOnlyImportPayload);
    }

    const body = rawBody as ImportPayload;
    const overwriteExisting = body.overwriteExisting !== false;

    const normalizedCourse = normalizeCourse(body.course);
    if (!normalizedCourse.valid) {
      return NextResponse.json(
        { error: normalizedCourse.error },
        { status: 422 },
      );
    }

    const chapters = body.chapters.map(normalizeChapter);
    const invalidChapter = chapters.find((chapter) => !chapter.valid);
    if (invalidChapter && !invalidChapter.valid) {
      return NextResponse.json(
        { error: invalidChapter.error },
        { status: 422 },
      );
    }

    const exercises = body.chapterExercises.map((exercise) =>
      normalizeExercise(exercise),
    );
    const invalidExercise = exercises.find((exercise) => !exercise.valid);
    if (invalidExercise && !invalidExercise.valid) {
      return NextResponse.json(
        { error: invalidExercise.error },
        { status: 422 },
      );
    }

    let courseRecord = (
      await db
        .select()
        .from(CourseTable)
        .where(eq(CourseTable.courseId, normalizedCourse.data.courseId))
        .limit(1)
    )[0];

    if (!courseRecord) {
      const [insertedCourse] = await db
        .insert(CourseTable)
        .values({
          courseId: normalizedCourse.data.courseId,
          title: normalizedCourse.data.title,
          description: normalizedCourse.data.description,
          bannerImage: normalizedCourse.data.bannerImage,
          level: normalizedCourse.data.level,
          tags: normalizedCourse.data.tags,
        })
        .returning();

      courseRecord = insertedCourse;
    }

    const chapterIdByName = new Map<string, number>();

    for (const chapterResult of chapters) {
      if (!chapterResult.valid) continue;
      const chapter = chapterResult.data;

      const existingChapter = (
        await db
          .select()
          .from(CourseChapterTable)
          .where(
            and(
              eq(CourseChapterTable.courseId, normalizedCourse.data.courseId),
              eq(CourseChapterTable.name, chapter.name),
            ),
          )
          .limit(1)
      )[0];

      if (existingChapter) {
        chapterIdByName.set(chapter.name, existingChapter.id);
      } else {
        const [insertedChapter] = await db
          .insert(CourseChapterTable)
          .values({
            courseId: normalizedCourse.data.courseId,
            name: chapter.name,
            desc: chapter.desc,
            exercise: chapter.exercise || null,
          })
          .returning();

        chapterIdByName.set(chapter.name, insertedChapter.id);
      }
    }

    let importedExercisesCount = 0;

    for (const exerciseResult of exercises) {
      if (!exerciseResult.valid) continue;
      const exercise = exerciseResult.data;

      const chapterId = chapterIdByName.get(exercise.chapterName);
      if (!chapterId) {
        return NextResponse.json(
          {
            error: `Exercise chapterName not found in chapters list: ${exercise.chapterName}`,
          },
          { status: 422 },
        );
      }

      if (overwriteExisting) {
        await db
          .delete(ChapterContentTable)
          .where(eq(ChapterContentTable.chapterId, chapterId));
      }

      await db.insert(ChapterContentTable).values({
        chapterId,
        title: exercise.draft.title,
        problemStatement: exercise.draft.problemStatement,
        instructions: exercise.draft.instructions,
        expectedOutput: exercise.draft.expectedOutput,
        hints: exercise.draft.hints || null,
        questionType: exercise.questionType,
        boilerplateFiles: JSON.stringify(exercise.draft.boilerplateFiles),
        testCases: JSON.stringify(exercise.draft.testCases),
        solutionCode: exercise.draft.solutionCode,
        order: 0,
      });

      importedExercisesCount += 1;
    }

    return NextResponse.json({
      success: true,
      message: "JSON package imported successfully",
      summary: {
        courseId: normalizedCourse.data.courseId,
        chaptersImported: chapterIdByName.size,
        exercisesImported: importedExercisesCount,
      },
    });
  } catch (error) {
    console.error("Error importing web-dev package:", error);
    return NextResponse.json(
      {
        error: "Failed to import JSON package",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

async function importExistingChapterContent(body: ContentOnlyImportPayload) {
  if (Array.isArray((body as any)?.chapterPackages)) {
    return importChapterPackages(
      body as unknown as ChapterPackagesImportPayload,
    );
  }

  const overwriteExisting = body.overwriteExisting !== false;
  const courseId = String(body.courseId || "")
    .trim()
    .toLowerCase();
  const chapterId = body.chapterId !== undefined ? Number(body.chapterId) : NaN;
  const chapterName = String(body.chapterName || "").trim();

  if (!courseId || (!Number.isFinite(chapterId) && !chapterName)) {
    return NextResponse.json(
      {
        error:
          "For content-only import, provide courseId and either chapterId or chapterName.",
      },
      { status: 400 },
    );
  }

  const course = (
    await db
      .select({
        id: CourseTable.id,
        courseId: CourseTable.courseId,
        tags: CourseTable.tags,
      })
      .from(CourseTable)
      .where(eq(CourseTable.courseId, courseId))
      .limit(1)
  )[0];

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const courseTags = (course.tags || "").toLowerCase();
  if (
    courseTags.includes("subject:dsa") ||
    courseTags.includes("subject:cs-fundamentals")
  ) {
    return NextResponse.json(
      {
        error:
          "This importer is for web-development tracks only (DSA/CS fundamentals excluded).",
      },
      { status: 400 },
    );
  }

  const chapter = (
    await db
      .select({
        id: CourseChapterTable.id,
        name: CourseChapterTable.name,
      })
      .from(CourseChapterTable)
      .where(
        Number.isFinite(chapterId)
          ? and(
              eq(CourseChapterTable.courseId, courseId),
              eq(CourseChapterTable.id, chapterId),
            )
          : and(
              eq(CourseChapterTable.courseId, courseId),
              eq(CourseChapterTable.name, chapterName),
            ),
      )
      .limit(1)
  )[0];

  if (!chapter) {
    return NextResponse.json(
      { error: "Chapter not found in selected course" },
      { status: 404 },
    );
  }

  const baseQuestionType = body.questionType;
  const parsedDrafts = normalizeDraftBatch(
    baseQuestionType,
    body,
    chapter.name,
  );
  if (!parsedDrafts.valid) {
    return NextResponse.json({ error: parsedDrafts.error }, { status: 422 });
  }

  if (overwriteExisting) {
    await db
      .delete(ChapterContentTable)
      .where(eq(ChapterContentTable.chapterId, chapter.id));
  }

  let nextOrder = 0;
  if (!overwriteExisting) {
    const existingRows = await db
      .select({ order: ChapterContentTable.order })
      .from(ChapterContentTable)
      .where(eq(ChapterContentTable.chapterId, chapter.id));

    const maxOrder = existingRows.reduce((max, row) => {
      const value = Number(row.order ?? 0);
      return Number.isFinite(value) && value > max ? value : max;
    }, -1);
    nextOrder = maxOrder + 1;
  }

  for (const item of parsedDrafts.data) {
    await db.insert(ChapterContentTable).values({
      chapterId: chapter.id,
      title: item.draft.title,
      problemStatement: item.draft.problemStatement,
      instructions: item.draft.instructions,
      expectedOutput: item.draft.expectedOutput,
      hints: item.draft.hints || null,
      questionType: item.questionType,
      boilerplateFiles: JSON.stringify(item.draft.boilerplateFiles),
      testCases: JSON.stringify(item.draft.testCases),
      solutionCode: item.draft.solutionCode,
      order: nextOrder,
    });
    nextOrder += 1;
  }

  return NextResponse.json({
    success: true,
    message: "Chapter content imported successfully",
    summary: {
      courseId,
      chapterId: chapter.id,
      chapterName: chapter.name,
      questionType: baseQuestionType,
      exercisesImported: parsedDrafts.data.length,
    },
  });
}

function normalizeDraftBatch(
  defaultQuestionType: WebDevQuestionType,
  body: ContentOnlyImportPayload,
  chapterLabel: string,
):
  | {
      valid: true;
      data: Array<{ questionType: WebDevQuestionType; draft: ExerciseDraft }>;
    }
  | { valid: false; error: string } {
  if (!WEB_DEV_TYPES.includes(defaultQuestionType)) {
    return {
      valid: false,
      error: `Invalid questionType: ${defaultQuestionType}`,
    };
  }

  if (Array.isArray(body.drafts) && body.drafts.length > 0) {
    const normalizedItems: Array<{
      questionType: WebDevQuestionType;
      draft: ExerciseDraft;
    }> = [];

    for (let index = 0; index < body.drafts.length; index += 1) {
      const rawItem = body.drafts[index] as BulkDraftWithType;
      const resolvedQuestionType =
        rawItem && "questionType" in rawItem && rawItem.questionType
          ? rawItem.questionType
          : defaultQuestionType;

      if (!WEB_DEV_TYPES.includes(resolvedQuestionType)) {
        return {
          valid: false,
          error: `Invalid questionType in drafts[${index}]`,
        };
      }

      const candidateDraft =
        rawItem && "draft" in rawItem && rawItem.draft
          ? rawItem.draft
          : (rawItem as ExerciseDraft);

      const normalized = normalizeExerciseDraft(
        resolvedQuestionType,
        candidateDraft,
        `${chapterLabel} (item ${index + 1})`,
      );

      if (!normalized.valid) {
        return normalized;
      }

      normalizedItems.push({
        questionType: resolvedQuestionType,
        draft: normalized.data,
      });
    }

    return { valid: true, data: normalizedItems };
  }

  const normalizedSingle = normalizeExerciseDraft(
    defaultQuestionType,
    body.draft,
    chapterLabel,
  );

  if (!normalizedSingle.valid) {
    return normalizedSingle;
  }

  return {
    valid: true,
    data: [{ questionType: defaultQuestionType, draft: normalizedSingle.data }],
  };
}

async function importChapterPackages(body: ChapterPackagesImportPayload) {
  const courseId = String(body.courseId || "")
    .trim()
    .toLowerCase();
  const overwriteExisting = body.overwriteExisting !== false;
  const defaultQuestionType = body.questionType;

  if (!courseId) {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(body.chapterPackages) ||
    body.chapterPackages.length === 0
  ) {
    return NextResponse.json(
      { error: "chapterPackages must be a non-empty array" },
      { status: 400 },
    );
  }

  if (defaultQuestionType && !WEB_DEV_TYPES.includes(defaultQuestionType)) {
    return NextResponse.json(
      { error: `Invalid questionType: ${defaultQuestionType}` },
      { status: 422 },
    );
  }

  const course = (
    await db
      .select({
        id: CourseTable.id,
        tags: CourseTable.tags,
      })
      .from(CourseTable)
      .where(eq(CourseTable.courseId, courseId))
      .limit(1)
  )[0];

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const courseTags = (course.tags || "").toLowerCase();
  if (
    courseTags.includes("subject:dsa") ||
    courseTags.includes("subject:cs-fundamentals")
  ) {
    return NextResponse.json(
      {
        error:
          "This importer is for web-development tracks only (DSA/CS fundamentals excluded).",
      },
      { status: 400 },
    );
  }

  let exercisesImported = 0;
  let chaptersProcessed = 0;
  let chaptersCreated = 0;
  const clearedChapterIds = new Set<number>();

  for (let index = 0; index < body.chapterPackages.length; index += 1) {
    const rawPackage = body.chapterPackages[index];
    const chapterNode = rawPackage.chapter || rawPackage;

    const chapterResult = normalizeChapter({
      name: chapterNode.name || "",
      desc: chapterNode.desc || chapterNode.description || "",
      exercise: chapterNode.exercise || chapterNode.exerciseIntent || "",
    });

    if (!chapterResult.valid) {
      return NextResponse.json(
        { error: `chapterPackages[${index}] ${chapterResult.error}` },
        { status: 422 },
      );
    }

    let chapter = (
      await db
        .select({ id: CourseChapterTable.id, name: CourseChapterTable.name })
        .from(CourseChapterTable)
        .where(
          and(
            eq(CourseChapterTable.courseId, courseId),
            eq(CourseChapterTable.name, chapterResult.data.name),
          ),
        )
        .limit(1)
    )[0];

    if (!chapter) {
      const [inserted] = await db
        .insert(CourseChapterTable)
        .values({
          courseId,
          name: chapterResult.data.name,
          desc: chapterResult.data.desc,
          exercise: chapterResult.data.exercise || null,
        })
        .returning({
          id: CourseChapterTable.id,
          name: CourseChapterTable.name,
        });

      chapter = inserted;
      chaptersCreated += 1;
    } else {
      await db
        .update(CourseChapterTable)
        .set({
          desc: chapterResult.data.desc,
          exercise: chapterResult.data.exercise || null,
        })
        .where(eq(CourseChapterTable.id, chapter.id));
    }

    chaptersProcessed += 1;

    const effectiveQuestionType =
      rawPackage.questionType || defaultQuestionType || "react";

    if (!WEB_DEV_TYPES.includes(effectiveQuestionType)) {
      return NextResponse.json(
        {
          error: `Invalid questionType in chapterPackages[${index}]`,
        },
        { status: 422 },
      );
    }

    const draftBatch = normalizeDraftBatch(
      effectiveQuestionType,
      {
        courseId,
        chapterId: chapter.id,
        questionType: effectiveQuestionType,
        draft: rawPackage.draft as ExerciseDraft,
        drafts: rawPackage.drafts,
        overwriteExisting,
      },
      chapter.name,
    );

    if (!draftBatch.valid) {
      return NextResponse.json(
        {
          error: `chapterPackages[${index}] ${draftBatch.error}`,
        },
        { status: 422 },
      );
    }

    if (overwriteExisting && !clearedChapterIds.has(chapter.id)) {
      await db
        .delete(ChapterContentTable)
        .where(eq(ChapterContentTable.chapterId, chapter.id));
      clearedChapterIds.add(chapter.id);
    }

    let nextOrder = 0;
    if (!overwriteExisting) {
      const existingRows = await db
        .select({ order: ChapterContentTable.order })
        .from(ChapterContentTable)
        .where(eq(ChapterContentTable.chapterId, chapter.id));

      const maxOrder = existingRows.reduce((max, row) => {
        const value = Number(row.order ?? 0);
        return Number.isFinite(value) && value > max ? value : max;
      }, -1);
      nextOrder = maxOrder + 1;
    }

    for (const item of draftBatch.data) {
      await db.insert(ChapterContentTable).values({
        chapterId: chapter.id,
        title: item.draft.title,
        problemStatement: item.draft.problemStatement,
        instructions: item.draft.instructions,
        expectedOutput: item.draft.expectedOutput,
        hints: item.draft.hints || null,
        questionType: item.questionType,
        boilerplateFiles: JSON.stringify(item.draft.boilerplateFiles),
        testCases: JSON.stringify(item.draft.testCases),
        solutionCode: item.draft.solutionCode,
        order: nextOrder,
      });
      nextOrder += 1;
      exercisesImported += 1;
    }
  }

  return NextResponse.json({
    success: true,
    message: "Chapter packages imported successfully",
    summary: {
      courseId,
      chaptersProcessed,
      chaptersCreated,
      exercisesImported,
    },
  });
}

function normalizeCourse(course: ImportCoursePayload):
  | {
      valid: true;
      data: {
        courseId: string;
        title: string;
        description: string;
        bannerImage: string;
        level: string;
        tags: string;
      };
    }
  | { valid: false; error: string } {
  const courseId = String(course?.courseId || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const title = String(course?.title || "").trim();
  const description = String(course?.description || "").trim();
  const bannerImage = String(
    course?.bannerImage || "https://via.placeholder.com/800x400",
  ).trim();
  const level = String(course?.level || "beginner").trim();
  const extraTags = String(course?.tags || "");

  if (!courseId || !title || !description) {
    return {
      valid: false,
      error:
        "course.courseId, course.title, and course.description are required",
    };
  }

  const tagList = ["subject:web-dev", ...extraTags.split(",")]
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (
    tagList.some(
      (tag) =>
        tag.toLowerCase() === "subject:dsa" ||
        tag.toLowerCase() === "subject:cs-fundamentals",
    )
  ) {
    return {
      valid: false,
      error:
        "Payload tags cannot include subject:dsa or subject:cs-fundamentals",
    };
  }

  return {
    valid: true,
    data: {
      courseId,
      title,
      description,
      bannerImage,
      level,
      tags: Array.from(new Set(tagList)).join(", "),
    },
  };
}

function normalizeChapter(
  chapter: ImportChapterPayload,
):
  | { valid: true; data: { name: string; desc: string; exercise?: string } }
  | { valid: false; error: string } {
  const name = String(chapter?.name || "").trim();
  const desc = String(chapter?.desc || "").trim();
  const exercise = chapter?.exercise
    ? String(chapter.exercise).trim()
    : undefined;

  if (!name || !desc) {
    return {
      valid: false,
      error: "Each chapter requires name and desc",
    };
  }

  return {
    valid: true,
    data: {
      name,
      desc,
      exercise,
    },
  };
}

function normalizeExercise(exercise: ImportExercisePayload):
  | {
      valid: true;
      data: {
        chapterName: string;
        questionType: WebDevQuestionType;
        draft: ExerciseDraft;
      };
    }
  | { valid: false; error: string } {
  const chapterName = String(exercise?.chapterName || "").trim();
  const questionType = exercise?.questionType;
  const draft = exercise?.draft;

  if (!chapterName || !questionType || !draft) {
    return {
      valid: false,
      error:
        "Each chapterExercise requires chapterName, questionType and draft",
    };
  }

  if (!WEB_DEV_TYPES.includes(questionType)) {
    return {
      valid: false,
      error: `Invalid questionType: ${questionType}`,
    };
  }

  const normalizedDraft = normalizeExerciseDraft(
    questionType,
    draft,
    chapterName,
  );
  if (!normalizedDraft.valid) {
    return normalizedDraft;
  }

  return {
    valid: true,
    data: {
      chapterName,
      questionType,
      draft: normalizedDraft.data,
    },
  };
}

function normalizeExerciseDraft(
  questionType: WebDevQuestionType,
  draft: ExerciseDraft,
  chapterLabel: string,
): { valid: true; data: ExerciseDraft } | { valid: false; error: string } {
  if (!WEB_DEV_TYPES.includes(questionType)) {
    return {
      valid: false,
      error: `Invalid questionType for chapter '${chapterLabel}'`,
    };
  }

  const title = String(draft?.title || "").trim();
  const problemStatement = String(draft?.problemStatement || "").trim();
  const instructions = String(draft?.instructions || "").trim();
  const expectedOutput = String(draft?.expectedOutput || "").trim();
  const hints = draft?.hints ? String(draft.hints).trim() : "";
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
      error: `Exercise draft for chapter '${chapterLabel}' is missing required fields`,
    };
  }

  if (
    !Array.isArray(draft?.boilerplateFiles) ||
    draft.boilerplateFiles.length === 0
  ) {
    return {
      valid: false,
      error: `Exercise draft for chapter '${chapterLabel}' must include boilerplateFiles`,
    };
  }

  if (!Array.isArray(draft?.testCases) || draft.testCases.length === 0) {
    return {
      valid: false,
      error: `Exercise draft for chapter '${chapterLabel}' must include testCases`,
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
      error: `Exercise draft for chapter '${chapterLabel}' contains invalid boilerplateFiles`,
    };
  }

  const testCases = draft.testCases.map((testCase, index) => ({
    id: String(testCase?.id || `tc-${index + 1}`),
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
      error: `Exercise draft for chapter '${chapterLabel}' contains invalid testCases`,
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
