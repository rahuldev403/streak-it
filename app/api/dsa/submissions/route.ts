import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { DsaSubmissionTable, DsaQuestionTable } from "@/app/config/schema";
import { eq, and, desc } from "drizzle-orm";

// GET: Get all submissions for a user or a specific question
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const questionId = searchParams.get("questionId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    let query = db
      .select({
        submission: DsaSubmissionTable,
        questionTitle: DsaQuestionTable.title,
        questionDifficulty: DsaQuestionTable.difficulty,
      })
      .from(DsaSubmissionTable)
      .leftJoin(
        DsaQuestionTable,
        eq(DsaSubmissionTable.questionId, DsaQuestionTable.id)
      )
      .where(eq(DsaSubmissionTable.userId, userId))
      .orderBy(desc(DsaSubmissionTable.submittedAt));

    if (questionId) {
      query = db
        .select({
          submission: DsaSubmissionTable,
          questionTitle: DsaQuestionTable.title,
          questionDifficulty: DsaQuestionTable.difficulty,
        })
        .from(DsaSubmissionTable)
        .leftJoin(
          DsaQuestionTable,
          eq(DsaSubmissionTable.questionId, DsaQuestionTable.id)
        )
        .where(
          and(
            eq(DsaSubmissionTable.userId, userId),
            eq(DsaSubmissionTable.questionId, parseInt(questionId))
          )
        )
        .orderBy(desc(DsaSubmissionTable.submittedAt));
    }

    const submissions = await query;

    return NextResponse.json({
      success: true,
      submissions,
      count: submissions.length,
    });
  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
