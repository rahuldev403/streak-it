import { db } from "@/app/config/db";
import { CourseChapterTable } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const chapters = await db
      .select()
      .from(CourseChapterTable)
      .where(eq(CourseChapterTable.courseId, courseId));

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("Chapters API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
};
