import { db } from "@/app/config/db";
import { CsFundamentalsQuestionTable } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    let questions;

    if (category) {
      // Fetch questions for specific category
      questions = await db
        .select()
        .from(CsFundamentalsQuestionTable)
        .where(
          and(
            eq(CsFundamentalsQuestionTable.userId, userId),
            eq(CsFundamentalsQuestionTable.category, category),
          ),
        );
    } else {
      // Fetch all questions for user
      questions = await db
        .select()
        .from(CsFundamentalsQuestionTable)
        .where(eq(CsFundamentalsQuestionTable.userId, userId));
    }

    // Parse JSON fields
    const formattedQuestions = questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options),
      tags: q.tags ? JSON.parse(q.tags) : null,
    }));

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error("Error fetching CS fundamentals questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}
