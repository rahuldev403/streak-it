import { db } from "@/app/config/db";
import { CourseChapterTable, CourseTable } from "@/app/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!isAdmin(userEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Admin privileges required.",
        },
        { status: 403 },
      );
    }

    const { courseId, name, desc, exercise } = await req.json();

    const normalizedCourseId =
      typeof courseId === "string" ? courseId.trim().toLowerCase() : "";
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedDesc = typeof desc === "string" ? desc.trim() : "";
    const normalizedExercise =
      typeof exercise === "string" ? exercise.trim() : "";

    if (!normalizedCourseId || !normalizedName || !normalizedDesc) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID, name, and description are required",
        },
        { status: 400 },
      );
    }

    const matchingCourses = await db
      .select({
        courseId: CourseTable.courseId,
        tags: CourseTable.tags,
      })
      .from(CourseTable)
      .where(eq(CourseTable.courseId, normalizedCourseId))
      .limit(1);

    if (matchingCourses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        { status: 404 },
      );
    }

    const courseTags = (matchingCourses[0].tags || "").toLowerCase();
    if (
      courseTags.includes("subject:dsa") ||
      courseTags.includes("subject:cs-fundamentals")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Chapter creation here is restricted to web-development tracks (DSA/CS fundamentals are excluded).",
        },
        { status: 400 },
      );
    }

    const result = await db.insert(CourseChapterTable).values({
      courseId: normalizedCourseId,
      name: normalizedName,
      desc: normalizedDesc,
      exercise: normalizedExercise || null,
    });

    return NextResponse.json({
      success: true,
      message: `Chapter "${name}" added successfully!`,
      chapter: result,
    });
  } catch (error) {
    console.error("Error adding chapter:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add chapter",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
