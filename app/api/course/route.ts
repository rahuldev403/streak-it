import { db } from "@/app/config/db";
import { CourseTable, EnrolledCourseTable } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const user = await currentUser();

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

      let isEnrolled = false;

      const enrolledCourse = await db
        .select()
        .from(EnrolledCourseTable)
        .where(
          and(
            eq(EnrolledCourseTable.courseId, courseId),

            eq(EnrolledCourseTable.userId, user?.id)
          )
        );
      isEnrolled = enrolledCourse.length > 0;

      return NextResponse.json({
        ...result[0],
        isEnrolled,
        enrolledCourse: enrolledCourse[0] || null,
      });
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
