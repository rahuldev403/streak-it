import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { DsaQuestionTable } from "@/app/config/schema";
import { eq, and } from "drizzle-orm";

// GET: Get a specific DSA question by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { questionId: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const questionId = parseInt(params.questionId);

    const [question] = await db
      .select()
      .from(DsaQuestionTable)
      .where(
        and(
          eq(DsaQuestionTable.id, questionId),
          eq(DsaQuestionTable.userId, userId),
        ),
      )
      .limit(1);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found or doesn't belong to this user" },
        { status: 404 },
      );
    }

    // Parse JSON fields
    const parsedQuestion = {
      ...question,
      examples: JSON.parse(question.examples),
      testCases: JSON.parse(question.testCases),
      starterCode: JSON.parse(question.starterCode),
      hints: question.hints ? JSON.parse(question.hints) : [],
    };

    return NextResponse.json({
      success: true,
      question: parsedQuestion,
    });
  } catch (error: any) {
    console.error("Error fetching DSA question:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch question" },
      { status: 500 },
    );
  }
}
