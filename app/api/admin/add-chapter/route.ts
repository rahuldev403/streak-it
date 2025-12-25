import { db } from "@/app/config/db";
import { CourseChapterTable } from "@/app/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!isAdmin(userEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Admin privileges required.",
        },
        { status: 403 }
      );
    }

    const { courseId, name, desc, exercise } = await req.json();

    if (!courseId || !name || !desc) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID, name, and description are required",
        },
        { status: 400 }
      );
    }

    const result = await db.insert(CourseChapterTable).values({
      courseId,
      name,
      desc,
      exercise: exercise || null,
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
      { status: 500 }
    );
  }
}
