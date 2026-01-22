import { db } from "@/app/config/db";
import { CourseTable } from "@/app/config/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set");
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 },
      );
    }

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
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}
