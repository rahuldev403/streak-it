import { db } from "@/app/config/db";
import { ChapterContentTable } from "@/app/config/schema";
import { isAdmin } from "@/lib/admin";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type WebDevQuestionType =
  | "html-css-js"
  | "react"
  | "nextjs"
  | "nodejs"
  | "typescript";

const WEB_DEV_TYPES: WebDevQuestionType[] = [
  "html-css-js",
  "react",
  "nextjs",
  "nodejs",
  "typescript",
];

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
    const contentId = Number(body?.contentId);

    if (!Number.isFinite(contentId)) {
      return NextResponse.json(
        { error: "contentId is required" },
        { status: 400 },
      );
    }

    const updates: Record<string, string | number | null> = {};

    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.problemStatement !== undefined) {
      updates.problemStatement = String(body.problemStatement).trim();
    }
    if (body.instructions !== undefined) {
      updates.instructions = String(body.instructions).trim();
    }
    if (body.expectedOutput !== undefined) {
      updates.expectedOutput = String(body.expectedOutput).trim();
    }
    if (body.hints !== undefined) {
      const hints = String(body.hints).trim();
      updates.hints = hints || null;
    }
    if (body.solutionCode !== undefined) {
      updates.solutionCode = String(body.solutionCode);
    }
    if (body.order !== undefined) {
      const order = Number(body.order);
      if (!Number.isFinite(order)) {
        return NextResponse.json(
          { error: "order must be a number" },
          { status: 400 },
        );
      }
      updates.order = order;
    }

    if (body.questionType !== undefined) {
      const questionType = String(
        body.questionType,
      ).trim() as WebDevQuestionType;
      if (!WEB_DEV_TYPES.includes(questionType)) {
        return NextResponse.json(
          { error: "Invalid questionType" },
          { status: 400 },
        );
      }
      updates.questionType = questionType;
    }

    if (body.boilerplateFiles !== undefined) {
      if (!Array.isArray(body.boilerplateFiles)) {
        return NextResponse.json(
          { error: "boilerplateFiles must be an array" },
          { status: 400 },
        );
      }
      updates.boilerplateFiles = JSON.stringify(body.boilerplateFiles);
    }

    if (body.testCases !== undefined) {
      if (!Array.isArray(body.testCases)) {
        return NextResponse.json(
          { error: "testCases must be an array" },
          { status: 400 },
        );
      }
      updates.testCases = JSON.stringify(body.testCases);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 },
      );
    }

    const updated = await db
      .update(ChapterContentTable)
      .set(updates)
      .where(eq(ChapterContentTable.id, contentId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const content = {
      ...updated[0],
      boilerplateFiles: JSON.parse(updated[0].boilerplateFiles || "[]"),
      testCases: JSON.parse(updated[0].testCases || "[]"),
    };

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const contentId = Number(body?.contentId);

    if (!Number.isFinite(contentId)) {
      return NextResponse.json(
        { error: "contentId is required" },
        { status: 400 },
      );
    }

    const deleted = await db
      .delete(ChapterContentTable)
      .where(eq(ChapterContentTable.id, contentId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Content deleted successfully",
      content: deleted[0],
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 },
    );
  }
}
