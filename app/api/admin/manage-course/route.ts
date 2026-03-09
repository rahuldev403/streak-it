import { db } from "@/app/config/db";
import {
  ChapterContentTable,
  CourseChapterTable,
  CourseTable,
} from "@/app/config/schema";
import { hasAdminAccess } from "@/lib/admin";
import { currentUser } from "@clerk/nextjs/server";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const DISALLOWED_SUBJECTS = ["subject:dsa", "subject:cs-fundamentals"];

const requireAdmin = async () => {
  const user = await currentUser();
  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const email = user.primaryEmailAddress?.emailAddress;
  if (!hasAdminAccess(email, user.publicMetadata?.isAdmin)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const };
};

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const courseId = String(body?.courseId || "")
      .trim()
      .toLowerCase();

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 },
      );
    }

    const updates: Record<string, string> = {};

    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.description !== undefined)
      updates.description = String(body.description).trim();
    if (body.bannerImage !== undefined)
      updates.bannerImage = String(body.bannerImage).trim();
    if (body.level !== undefined) updates.level = String(body.level).trim();

    if (body.tags !== undefined) {
      const tags = String(body.tags)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      if (tags.some((tag) => DISALLOWED_SUBJECTS.includes(tag.toLowerCase()))) {
        return NextResponse.json(
          { error: "Tags cannot include DSA/CS fundamentals subjects" },
          { status: 400 },
        );
      }

      const finalTags = ["subject:web-dev", ...tags]
        .filter((value, index, array) => array.indexOf(value) === index)
        .join(", ");

      updates.tags = finalTags;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 },
      );
    }

    const updated = await db
      .update(CourseTable)
      .set(updates)
      .where(eq(CourseTable.courseId, courseId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, course: updated[0] });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const courseId = String(body?.courseId || "")
      .trim()
      .toLowerCase();
    const deleteDependents = body?.deleteDependents !== false;

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 },
      );
    }

    if (deleteDependents) {
      const chapters = await db
        .select({ id: CourseChapterTable.id })
        .from(CourseChapterTable)
        .where(eq(CourseChapterTable.courseId, courseId));

      const chapterIds = chapters.map((chapter) => chapter.id);
      if (chapterIds.length > 0) {
        await db
          .delete(ChapterContentTable)
          .where(inArray(ChapterContentTable.chapterId, chapterIds));
      }

      await db
        .delete(CourseChapterTable)
        .where(eq(CourseChapterTable.courseId, courseId));
    }

    const deleted = await db
      .delete(CourseTable)
      .where(eq(CourseTable.courseId, courseId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
      course: deleted[0],
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 },
    );
  }
}
