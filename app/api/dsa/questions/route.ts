import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { DsaQuestionTable } from "@/app/config/schema";
import { eq, and, desc } from "drizzle-orm";

// GET: Get all DSA questions for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const questions = await db
      .select()
      .from(DsaQuestionTable)
      .where(eq(DsaQuestionTable.userId, userId))
      .orderBy(desc(DsaQuestionTable.generatedAt));

    return NextResponse.json({
      success: true,
      questions,
      count: questions.length,
    });
  } catch (error: any) {
    console.error("Error fetching DSA questions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch questions" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a specific question
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");
    const userId = searchParams.get("userId");

    if (!questionId || !userId) {
      return NextResponse.json(
        { error: "Question ID and User ID are required" },
        { status: 400 },
      );
    }

    await db
      .delete(DsaQuestionTable)
      .where(
        and(
          eq(DsaQuestionTable.id, parseInt(questionId)),
          eq(DsaQuestionTable.userId, userId),
        ),
      );

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting DSA question:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete question" },
      { status: 500 },
    );
  }
}
