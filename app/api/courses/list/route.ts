import { db } from "@/app/config/db";
import { CourseTable } from "@/app/config/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const courses = await db
      .select({
        id: CourseTable.id,
        courseId: CourseTable.courseId,
        title: CourseTable.title,
        description: CourseTable.description,
      })
      .from(CourseTable);

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
