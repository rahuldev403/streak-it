import { db } from "@/app/config/db";
import { CourseTable } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (courseId) {
      const result = await db
        .select()
        .from(CourseTable)
        .where(eq(CourseTable.courseId, courseId));

      if (result.length === 0) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(result[0]);
    }

    const result = await db.select().from(CourseTable);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Course API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch course data" },
      { status: 500 }
    );
  }
};
