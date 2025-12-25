import { db } from "@/app/config/db";
import { CourseTable } from "@/app/config/schema";
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

    const { courseId, title, description, bannerImage, level, tags } =
      await req.json();

    if (!courseId || !title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID, title, and description are required",
        },
        { status: 400 }
      );
    }

    const result = await db.insert(CourseTable).values({
      courseId,
      title,
      description,
      bannerImage: bannerImage || "https://via.placeholder.com/800x400",
      level: level || "beginner",
      tags: tags || "",
    });

    return NextResponse.json({
      success: true,
      message: `Course "${title}" added successfully!`,
      course: result,
    });
  } catch (error) {
    console.error("Error adding course:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add course. It might already exist.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
