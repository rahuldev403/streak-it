import { db } from "@/app/config/db";
import { ChapterContentTable } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";

const QUESTION_TYPES = new Set([
  "html-css-js",
  "react",
  "nextjs",
  "nodejs",
  "typescript",
  "mern",
]);

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json(
        { error: "Chapter ID is required" },
        { status: 400 },
      );
    }

    const contents = await db
      .select()
      .from(ChapterContentTable)
      .where(eq(ChapterContentTable.chapterId, parseInt(chapterId)));

    // Parse JSON fields
    const parsedContents = contents.map((content) => ({
      ...content,
      boilerplateFiles: JSON.parse(content.boilerplateFiles || "[]"),
      testCases: JSON.parse(content.testCases || "[]"),
    }));

    return NextResponse.json({ contents: parsedContents });
  } catch (error) {
    console.error("Chapter Content API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapter content" },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
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

    const body = await req.json();
    const {
      chapterId,
      title,
      problemStatement,
      instructions,
      expectedOutput,
      hints,
      questionType,
      boilerplateFiles,
      testCases,
      solutionCode,
      order,
    } = body;

    if (
      !chapterId ||
      !title ||
      !problemStatement ||
      !instructions ||
      !expectedOutput ||
      !questionType ||
      !solutionCode
    ) {
      return NextResponse.json(
        { error: "Missing required chapter content fields" },
        { status: 400 },
      );
    }

    if (!QUESTION_TYPES.has(questionType)) {
      return NextResponse.json(
        { error: "Invalid question type for chapter content" },
        { status: 400 },
      );
    }

    if (!Array.isArray(boilerplateFiles) || boilerplateFiles.length === 0) {
      return NextResponse.json(
        { error: "boilerplateFiles must be a non-empty array" },
        { status: 400 },
      );
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: "testCases must be a non-empty array" },
        { status: 400 },
      );
    }

    const parsedChapterId = Number(chapterId);
    if (!Number.isFinite(parsedChapterId)) {
      return NextResponse.json(
        { error: "chapterId must be a number" },
        { status: 400 },
      );
    }

    const content = await db
      .insert(ChapterContentTable)
      .values({
        chapterId: parsedChapterId,
        title,
        problemStatement,
        instructions,
        expectedOutput,
        hints: hints || null,
        questionType,
        boilerplateFiles: JSON.stringify(boilerplateFiles),
        testCases: JSON.stringify(testCases),
        solutionCode,
        order: order || 0,
      })
      .returning();

    return NextResponse.json({ content: content[0] }, { status: 201 });
  } catch (error) {
    console.error("Create Chapter Content Error:", error);
    return NextResponse.json(
      { error: "Failed to create chapter content" },
      { status: 500 },
    );
  }
};
