import { db } from "@/app/config/db";
import {
  usersTable,
  EnrolledCourseTable,
  CourseTable,
  CourseChapterTable,
  UserProgressTable,
  DsaSubmissionTable,
  CsFundamentalsSubmissionTable,
} from "@/app/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

interface SessionEntry {
  submittedAt: string;
  solved: boolean;
  type: "dsa" | "cs";
}

function toDateKey(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}

function buildLastSessionPerformance(entries: SessionEntry[]) {
  if (entries.length === 0) {
    return null;
  }

  const sorted = [...entries].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );

  const latestDateKey = toDateKey(sorted[0].submittedAt);
  if (!latestDateKey) return null;

  const lastSession = sorted.filter(
    (entry) => toDateKey(entry.submittedAt) === latestDateKey,
  );

  const attempted = lastSession.length;
  const solved = lastSession.filter((entry) => entry.solved).length;
  const dsaAttempted = lastSession.filter(
    (entry) => entry.type === "dsa",
  ).length;
  const dsaSolved = lastSession.filter(
    (entry) => entry.type === "dsa" && entry.solved,
  ).length;
  const csAttempted = lastSession.filter((entry) => entry.type === "cs").length;
  const csSolved = lastSession.filter(
    (entry) => entry.type === "cs" && entry.solved,
  ).length;

  return {
    date: latestDateKey,
    latestSubmissionAt: sorted[0].submittedAt,
    attempted,
    solved,
    accuracy: attempted > 0 ? Math.round((solved / attempted) * 100) : 0,
    breakdown: {
      dsaAttempted,
      dsaSolved,
      csAttempted,
      csSolved,
    },
  };
}

export const GET = async (req: NextRequest) => {
  try {
    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress.emailAddress;

    // Get user data
    const userData = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, userEmail))
      .limit(1);

    if (userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Get enrolled courses with course details
    const enrolledCourses = await db
      .select({
        id: EnrolledCourseTable.id,
        courseId: EnrolledCourseTable.courseId,
        enrolledDate: EnrolledCourseTable.enrolledDate,
        progress: EnrolledCourseTable.progress,
        title: CourseTable.title,
        description: CourseTable.description,
        bannerImage: CourseTable.bannerImage,
        level: CourseTable.level,
        tags: CourseTable.tags,
      })
      .from(EnrolledCourseTable)
      .leftJoin(
        CourseTable,
        eq(EnrolledCourseTable.courseId, CourseTable.courseId),
      )
      .where(eq(EnrolledCourseTable.userId, userId));

    // Get chapter counts for each enrolled course
    const coursesWithChapters = await Promise.all(
      enrolledCourses.map(async (course) => {
        const chapters = await db
          .select()
          .from(CourseChapterTable)
          .where(eq(CourseChapterTable.courseId, course.courseId));

        return {
          ...course,
          totalChapters: chapters.length,
          completedChapters: course.progress || 0,
        };
      }),
    );

    // Calculate stats
    const totalEnrolled = enrolledCourses.length;
    const totalCompleted = enrolledCourses.filter(
      (course) => course.progress === 100,
    ).length;

    // Get total completed chapters across all courses
    const completedChapters = enrolledCourses.reduce(
      (sum, course) => sum + (course.progress || 0),
      0,
    );

    // Estimate hours (assume 2 hours per chapter)
    const hoursLearned = completedChapters * 2;

    const stats = {
      coursesEnrolled: totalEnrolled,
      projectsCompleted: completedChapters, // Using completed chapters as projects
      certificatesEarned: totalCompleted,
      hoursLearned: hoursLearned,
    };

    const dsaSubmissions = await db
      .select({
        submittedAt: DsaSubmissionTable.submittedAt,
        status: DsaSubmissionTable.status,
      })
      .from(DsaSubmissionTable)
      .where(eq(DsaSubmissionTable.userId, userId))
      .orderBy(desc(DsaSubmissionTable.submittedAt))
      .limit(500);

    const csSubmissions = await db
      .select({
        submittedAt: CsFundamentalsSubmissionTable.submittedAt,
        isCorrect: CsFundamentalsSubmissionTable.isCorrect,
      })
      .from(CsFundamentalsSubmissionTable)
      .where(eq(CsFundamentalsSubmissionTable.userId, userId))
      .orderBy(desc(CsFundamentalsSubmissionTable.submittedAt))
      .limit(500);

    const lastSessionPerformance = buildLastSessionPerformance([
      ...dsaSubmissions.map((s) => ({
        submittedAt: s.submittedAt,
        solved: s.status === "accepted",
        type: "dsa" as const,
      })),
      ...csSubmissions.map((s) => ({
        submittedAt: s.submittedAt,
        solved: Number(s.isCorrect) === 1,
        type: "cs" as const,
      })),
    ]);

    return NextResponse.json({
      user: userData[0],
      enrolledCourses: coursesWithChapters,
      stats,
      lastSessionPerformance,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
};
