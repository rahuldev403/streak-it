import { db } from "@/app/config/db";
import { UserCsFundamentalsProgressTable } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    // Fetch progress for all categories
    const progress = await db
      .select()
      .from(UserCsFundamentalsProgressTable)
      .where(eq(UserCsFundamentalsProgressTable.userId, userId));

    // Calculate overall stats
    const overallStats = progress.reduce(
      (acc, p) => ({
        totalQuestionsSolved:
          acc.totalQuestionsSolved + (p.totalQuestionsSolved || 0),
        correctAnswers: acc.correctAnswers + (p.correctAnswers || 0),
        accuracy: 0,
      }),
      { totalQuestionsSolved: 0, correctAnswers: 0, accuracy: 0 },
    );

    overallStats.accuracy =
      overallStats.totalQuestionsSolved > 0
        ? (overallStats.correctAnswers / overallStats.totalQuestionsSolved) *
          100
        : 0;

    return NextResponse.json({
      success: true,
      progress,
      overallStats,
    });
  } catch (error) {
    console.error("Error fetching CS fundamentals progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 },
    );
  }
}
