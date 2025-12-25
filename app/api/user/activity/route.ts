import { db } from "@/app/config/db";
import { UserActivityTable, UserProgressTable } from "@/app/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, sql, and, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Get date 90 days ago
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const startDate = ninetyDaysAgo.toISOString().split("T")[0];

    // Try to get from UserActivityTable first
    let activities = await db
      .select({
        date: UserActivityTable.date,
        count: UserActivityTable.activitiesCount,
      })
      .from(UserActivityTable)
      .where(
        and(
          eq(UserActivityTable.userId, userId),
          gte(UserActivityTable.date, startDate)
        )
      );

    // If no activity data, generate from UserProgressTable
    if (activities.length === 0) {
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
              sql`DATE(${startDate})`
            )
          )
        )
        .groupBy(sql`DATE(${UserProgressTable.updatedAt})`);

      activities = progressData.map((item) => ({
        date: item.date,
        count: Number(item.count),
      }));
    }

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Failed to fetch user activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
