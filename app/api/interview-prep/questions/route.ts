import { db } from "@/app/config/db";
import {
  DsaQuestionTable,
  DsaSubmissionTable,
  CsFundamentalsQuestionTable,
  CsFundamentalsSubmissionTable,
} from "@/app/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

type QuestionType = "dsa" | "cs";

interface QuestionOverviewItem {
  id: number;
  type: QuestionType;
  category: string;
  title: string;
  difficulty: string;
  generatedAt: string;
  solved: boolean;
  attempts: number;
  lastSubmittedAt: string | null;
}

function normalizeCategory(raw: string) {
  if (raw === "network") return "networking";
  return raw;
}

function buildCategorySummary(items: QuestionOverviewItem[]) {
  const categories = ["dsa", "dbms", "oops", "os", "networking"];

  const seed = categories.reduce(
    (acc, category) => {
      acc[category] = { total: 0, solved: 0, unsolved: 0 };
      return acc;
    },
    {} as Record<string, { total: number; solved: number; unsolved: number }>,
  );

  for (const item of items) {
    const categoryKey = normalizeCategory(item.category);
    if (!seed[categoryKey]) {
      seed[categoryKey] = { total: 0, solved: 0, unsolved: 0 };
    }

    seed[categoryKey].total += 1;
    if (item.solved) {
      seed[categoryKey].solved += 1;
    } else {
      seed[categoryKey].unsolved += 1;
    }
  }

  return seed;
}

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const [dsaQuestions, dsaSubmissions, csQuestions, csSubmissions] =
      await Promise.all([
        db
          .select()
          .from(DsaQuestionTable)
          .where(eq(DsaQuestionTable.userId, userId))
          .orderBy(desc(DsaQuestionTable.generatedAt)),
        db
          .select({
            questionId: DsaSubmissionTable.questionId,
            status: DsaSubmissionTable.status,
            submittedAt: DsaSubmissionTable.submittedAt,
          })
          .from(DsaSubmissionTable)
          .where(eq(DsaSubmissionTable.userId, userId))
          .orderBy(desc(DsaSubmissionTable.submittedAt)),
        db
          .select()
          .from(CsFundamentalsQuestionTable)
          .where(eq(CsFundamentalsQuestionTable.userId, userId))
          .orderBy(desc(CsFundamentalsQuestionTable.generatedAt)),
        db
          .select({
            questionId: CsFundamentalsSubmissionTable.questionId,
            isCorrect: CsFundamentalsSubmissionTable.isCorrect,
            submittedAt: CsFundamentalsSubmissionTable.submittedAt,
          })
          .from(CsFundamentalsSubmissionTable)
          .where(eq(CsFundamentalsSubmissionTable.userId, userId))
          .orderBy(desc(CsFundamentalsSubmissionTable.submittedAt)),
      ]);

    const dsaSubmissionMap = new Map<
      number,
      { attempts: number; solved: boolean; lastSubmittedAt: string | null }
    >();

    for (const submission of dsaSubmissions) {
      const entry = dsaSubmissionMap.get(submission.questionId) || {
        attempts: 0,
        solved: false,
        lastSubmittedAt: null,
      };

      entry.attempts += 1;
      if (!entry.lastSubmittedAt) {
        entry.lastSubmittedAt = submission.submittedAt;
      }
      if (submission.status === "accepted") {
        entry.solved = true;
      }

      dsaSubmissionMap.set(submission.questionId, entry);
    }

    const csSubmissionMap = new Map<
      number,
      { attempts: number; solved: boolean; lastSubmittedAt: string | null }
    >();

    for (const submission of csSubmissions) {
      const entry = csSubmissionMap.get(submission.questionId) || {
        attempts: 0,
        solved: false,
        lastSubmittedAt: null,
      };

      entry.attempts += 1;
      if (!entry.lastSubmittedAt) {
        entry.lastSubmittedAt = submission.submittedAt;
      }
      if (Number(submission.isCorrect) === 1) {
        entry.solved = true;
      }

      csSubmissionMap.set(submission.questionId, entry);
    }

    const dsaItems: QuestionOverviewItem[] = dsaQuestions.map((q) => {
      const submissionData = dsaSubmissionMap.get(q.id);
      return {
        id: q.id,
        type: "dsa",
        category: "dsa",
        title: q.title,
        difficulty: q.difficulty,
        generatedAt: q.generatedAt,
        solved: submissionData?.solved || false,
        attempts: submissionData?.attempts || 0,
        lastSubmittedAt: submissionData?.lastSubmittedAt || null,
      };
    });

    const csItems: QuestionOverviewItem[] = csQuestions.map((q) => {
      const submissionData = csSubmissionMap.get(q.id);
      return {
        id: q.id,
        type: "cs",
        category: normalizeCategory(q.category),
        title: q.question,
        difficulty: q.difficulty,
        generatedAt: q.generatedAt,
        solved: submissionData?.solved || false,
        attempts: submissionData?.attempts || 0,
        lastSubmittedAt: submissionData?.lastSubmittedAt || null,
      };
    });

    const questions = [...dsaItems, ...csItems].sort(
      (a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
    );

    const total = questions.length;
    const solved = questions.filter((q) => q.solved).length;
    const unsolved = total - solved;

    return NextResponse.json({
      success: true,
      questions,
      summary: {
        total,
        solved,
        unsolved,
        solveRate: total > 0 ? Math.round((solved / total) * 100) : 0,
      },
      byCategory: buildCategorySummary(questions),
    });
  } catch (error) {
    console.error("Error fetching interview prep question overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch question overview" },
      { status: 500 },
    );
  }
}
