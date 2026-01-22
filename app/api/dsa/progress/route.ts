import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { UserDsaProgressTable } from "@/app/config/schema";
import { eq } from "drizzle-orm";

// GET: Get user's DSA progress
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

    const [progress] = await db
      .select()
      .from(UserDsaProgressTable)
      .where(eq(UserDsaProgressTable.userId, userId))
      .limit(1);

    if (!progress) {
      // Create initial progress if doesn't exist
      const [newProgress] = await db
        .insert(UserDsaProgressTable)
        .values({
          userId,
          totalQuestionsSolved: 0,
          easyQuestionsSolved: 0,
          mediumQuestionsSolved: 0,
          hardQuestionsSolved: 0,
          skillLevel: "beginner",
          preferredCategories: JSON.stringify([]),
          weakCategories: JSON.stringify([]),
          lastActivityDate: new Date().toISOString(),
        })
        .returning();

      return NextResponse.json({
        success: true,
        progress: {
          ...newProgress,
          preferredCategories: [],
          weakCategories: [],
        },
      });
    }

    // Parse JSON fields
    const parsedProgress = {
      ...progress,
      preferredCategories: progress.preferredCategories
        ? JSON.parse(progress.preferredCategories)
        : [],
      weakCategories: progress.weakCategories
        ? JSON.parse(progress.weakCategories)
        : [],
    };

    return NextResponse.json({
      success: true,
      progress: parsedProgress,
    });
  } catch (error: any) {
    console.error("Error fetching DSA progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch progress" },
      { status: 500 },
    );
  }
}

// PUT: Update user's weak/strong categories
export async function PUT(req: NextRequest) {
  try {
    const { userId, weakCategories, preferredCategories } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const updates: any = {};

    if (weakCategories) {
      updates.weakCategories = JSON.stringify(weakCategories);
    }

    if (preferredCategories) {
      updates.preferredCategories = JSON.stringify(preferredCategories);
    }

    await db
      .update(UserDsaProgressTable)
      .set(updates)
      .where(eq(UserDsaProgressTable.userId, userId));

    return NextResponse.json({
      success: true,
      message: "Progress updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating DSA progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update progress" },
      { status: 500 },
    );
  }
}
