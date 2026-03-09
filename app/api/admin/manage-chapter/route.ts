import { db } from "@/app/config/db";
import { ChapterContentTable, CourseChapterTable } from "@/app/config/schema";
import { isAdmin } from "@/lib/admin";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const requireAdmin = async () => {
  const user = await currentUser();
  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const email = user.primaryEmailAddress?.emailAddress;
  if (!isAdmin(email)) {
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
    const chapterId = Number(body?.chapterId);

    if (!Number.isFinite(chapterId)) {
      return NextResponse.json(
        { error: "chapterId is required" },
        { status: 400 },
      );
    }

    const updates: Record<string, string | null> = {};

    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.desc !== undefined) updates.desc = String(body.desc).trim();
    if (body.exercise !== undefined) {
      const exercise = String(body.exercise).trim();
      updates.exercise = exercise || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 },
      );
    }

    const updated = await db
      .update(CourseChapterTable)
      .set(updates)
      .where(eq(CourseChapterTable.id, chapterId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, chapter: updated[0] });
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const chapterId = Number(body?.chapterId);
    const deleteContent = body?.deleteContent !== false;

    if (!Number.isFinite(chapterId)) {
      return NextResponse.json(
        { error: "chapterId is required" },
        { status: 400 },
      );
    }

    if (deleteContent) {
      await db
        .delete(ChapterContentTable)
        .where(eq(ChapterContentTable.chapterId, chapterId));
    }

    const deleted = await db
      .delete(CourseChapterTable)
      .where(eq(CourseChapterTable.id, chapterId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Chapter deleted successfully",
      chapter: deleted[0],
    });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 },
    );
  }
}
