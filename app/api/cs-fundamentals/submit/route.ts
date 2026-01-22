import { db } from "@/app/config/db";
import {
  CsFundamentalsSubmissionTable,
  CsFundamentalsQuestionTable,
  UserCsFundamentalsProgressTable,
} from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId, questionId, selectedAnswer } = await req.json();

    if (!userId || !questionId || !selectedAnswer) {
      return NextResponse.json(
        { error: "userId, questionId, and selectedAnswer are required" },
        { status: 400 },
      );
    }

    // Fetch the question to check correct answer
    const [question] = await db
      .select()
      .from(CsFundamentalsQuestionTable)
      .where(eq(CsFundamentalsQuestionTable.id, questionId));

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    // Check if answer is correct
    const isCorrect = selectedAnswer === question.correctAnswer;
    const currentTimestamp = new Date().toISOString();

    // Store submission
    const [submission] = await db
      .insert(CsFundamentalsSubmissionTable)
      .values({
        userId,
        questionId,
        selectedAnswer,
        isCorrect: isCorrect ? 1 : 0,
        submittedAt: currentTimestamp,
      })
      .returning();

    // Update user progress
    const [progress] = await db
      .select()
      .from(UserCsFundamentalsProgressTable)
      .where(
        and(
          eq(UserCsFundamentalsProgressTable.userId, userId),
          eq(UserCsFundamentalsProgressTable.category, question.category),
        ),
      );

    if (progress) {
      // Update existing progress
      const updates: any = {
        totalQuestionsSolved: progress.totalQuestionsSolved + 1,
        lastActivityDate: currentTimestamp,
      };

      if (isCorrect) {
        updates.correctAnswers = progress.correctAnswers + 1;
      }

      // Update difficulty-specific counts
      if (question.difficulty === "easy") {
        updates.easyQuestionsSolved = progress.easyQuestionsSolved + 1;
      } else if (question.difficulty === "medium") {
        updates.mediumQuestionsSolved = progress.mediumQuestionsSolved + 1;
      } else if (question.difficulty === "hard") {
        updates.hardQuestionsSolved = progress.hardQuestionsSolved + 1;
      }

      await db
        .update(UserCsFundamentalsProgressTable)
        .set(updates)
        .where(
          and(
            eq(UserCsFundamentalsProgressTable.userId, userId),
            eq(UserCsFundamentalsProgressTable.category, question.category),
          ),
        );
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      submission: {
        ...submission,
        isCorrect: Boolean(submission.isCorrect),
      },
    });
  } catch (error) {
    console.error("Error submitting CS fundamentals answer:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 },
    );
  }
}
