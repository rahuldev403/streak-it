import { db } from "@/app/config/db";
import {
  UserActivityTable,
  UserProgressTable,
  DsaSubmissionTable,
  CsFundamentalsSubmissionTable,
} from "@/app/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, sql, and, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

interface ActivityPoint {
  date: string;
  count: number;
}

function dateKey(isoDate: string) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

function calculateStreak(activities: ActivityPoint[]) {
  const activeDays = new Set(
    activities.filter((item) => item.count > 0).map((item) => item.date),
  );

  let currentStreak = 0;
  const cursor = new Date();

  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (!activeDays.has(key)) break;
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = [...activeDays].sort();
  let longestStreak = 0;
  let streak = 0;
  let prevDate: Date | null = null;

  for (const key of sorted) {
    const current = new Date(`${key}T00:00:00Z`);
    if (
      prevDate &&
      Math.round((current.getTime() - prevDate.getTime()) / 86400000) === 1
    ) {
      streak += 1;
    } else {
      streak = 1;
    }
    if (streak > longestStreak) longestStreak = streak;
    prevDate = current;
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: activeDays.size,
  };
}

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Return six months of data for a LeetCode-style streak view.
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 180);
    const startDate = fromDate.toISOString().split("T")[0];

    const dateCountMap = new Map<string, number>();

    // Explicit activity logs (if present)
    const activities = await db
      .select({
        date: UserActivityTable.date,
        count: UserActivityTable.activitiesCount,
      })
      .from(UserActivityTable)
      .where(
        and(
          eq(UserActivityTable.userId, userId),
          gte(UserActivityTable.date, startDate),
        ),
      );

    for (const item of activities) {
      dateCountMap.set(
        item.date,
        (dateCountMap.get(item.date) || 0) + item.count,
      );
    }

    // DSA submissions contribute to streak/heatmap.
    const dsaSubmissions = await db
      .select({ submittedAt: DsaSubmissionTable.submittedAt })
      .from(DsaSubmissionTable)
      .where(
        and(
          eq(DsaSubmissionTable.userId, userId),
          gte(DsaSubmissionTable.submittedAt, `${startDate}T00:00:00.000Z`),
        ),
      );

    for (const item of dsaSubmissions) {
      const key = dateKey(item.submittedAt);
      if (!key) continue;
      dateCountMap.set(key, (dateCountMap.get(key) || 0) + 1);
    }

    // CS fundamentals submissions contribute to streak/heatmap.
    const csSubmissions = await db
      .select({ submittedAt: CsFundamentalsSubmissionTable.submittedAt })
      .from(CsFundamentalsSubmissionTable)
      .where(
        and(
          eq(CsFundamentalsSubmissionTable.userId, userId),
          gte(
            CsFundamentalsSubmissionTable.submittedAt,
            `${startDate}T00:00:00.000Z`,
          ),
        ),
      );

    for (const item of csSubmissions) {
      const key = dateKey(item.submittedAt);
      if (!key) continue;
      dateCountMap.set(key, (dateCountMap.get(key) || 0) + 1);
    }

    // If no activity data, generate from UserProgressTable
    if (dateCountMap.size === 0) {
      const progressData = await db
        .select({
          date: sql<string>`DATE(${UserProgressTable.updatedAt})`.as("date"),
          count: sql<number>`COUNT(*)`.as("count"),
        })
        .from(UserProgressTable)
        .where(
          and(
            eq(UserProgressTable.userId, userId),
            gte(
              sql`DATE(${UserProgressTable.updatedAt})`,
              sql`DATE(${startDate})`,
            ),
          ),
        )
        .groupBy(sql`DATE(${UserProgressTable.updatedAt})`);

      for (const item of progressData) {
        dateCountMap.set(
          item.date,
          (dateCountMap.get(item.date) || 0) + Number(item.count),
        );
      }
    }

    const mergedActivities = Array.from(dateCountMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const streak = calculateStreak(mergedActivities);

    return NextResponse.json({
      activities: mergedActivities,
      streak,
    });
  } catch (error) {
    console.error("Failed to fetch user activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 },
    );
  }
}
