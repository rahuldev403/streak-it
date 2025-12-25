import { db } from "@/app/config/db";
import { ChapterContentTable } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json(
        { error: "Chapter ID is required" },
        { status: 400 }
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
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    // TODO: Add admin authentication check here
    // const session = await getServerSession();
    // if (!session || session.user.role !== "admin") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

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

    const content = await db
      .insert(ChapterContentTable)
      .values({
        chapterId: parseInt(chapterId),
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
      { status: 500 }
    );
  }
};
