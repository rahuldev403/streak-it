import { and, eq } from "drizzle-orm";
import { db } from "@/app/config/db";
import { UserAiGenerationLimitTable } from "@/app/config/schema";

const DAILY_LIMIT = 10;
const COOLDOWN_MINUTES = 15;

export const AI_DAILY_LIMIT = DAILY_LIMIT;
export const AI_COOLDOWN_MINUTES = COOLDOWN_MINUTES;

export interface AiRateLimitResult {
  allowed: boolean;
  status: number;
  error?: string;
  retryAfterSeconds?: number;
  remainingToday?: number;
}

export interface AiQuotaStatus {
  canGenerate: boolean;
  remainingToday: number;
  dailyLimit: number;
  cooldownRemainingSeconds: number;
}

const getUtcDateKey = () => new Date().toISOString().slice(0, 10);

export const consumeAiGenerationQuota = async (
  userId: string,
): Promise<AiRateLimitResult> => {
  const now = new Date();
  const nowIso = now.toISOString();
  const dateKey = getUtcDateKey();

  try {
    const rows = await db
      .select()
      .from(UserAiGenerationLimitTable)
      .where(
        and(
          eq(UserAiGenerationLimitTable.userId, userId),
          eq(UserAiGenerationLimitTable.dateKey, dateKey),
        ),
      )
      .limit(1);

    const existing = rows[0];

    if (!existing) {
      await db.insert(UserAiGenerationLimitTable).values({
        userId,
        dateKey,
        generationCount: 1,
        lastGenerationAt: nowIso,
        updatedAt: nowIso,
      });

      return {
        allowed: true,
        status: 200,
        remainingToday: DAILY_LIMIT - 1,
      };
    }

    if (existing.lastGenerationAt) {
      const lastTime = new Date(existing.lastGenerationAt).getTime();
      const elapsedMs = now.getTime() - lastTime;
      const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;

      if (elapsedMs < cooldownMs) {
        const retryAfterSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
        const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);

        return {
          allowed: false,
          status: 429,
          error: `Rate limit active. Try again in about ${retryAfterMinutes} minute(s).`,
          retryAfterSeconds,
          remainingToday: Math.max(DAILY_LIMIT - existing.generationCount, 0),
        };
      }
    }

    if (existing.generationCount >= DAILY_LIMIT) {
      return {
        allowed: false,
        status: 429,
        error: "Daily generation limit reached (10/10). Try again tomorrow.",
        remainingToday: 0,
      };
    }

    const nextCount = existing.generationCount + 1;

    await db
      .update(UserAiGenerationLimitTable)
      .set({
        generationCount: nextCount,
        lastGenerationAt: nowIso,
        updatedAt: nowIso,
      })
      .where(eq(UserAiGenerationLimitTable.id, existing.id));

    return {
      allowed: true,
      status: 200,
      remainingToday: Math.max(DAILY_LIMIT - nextCount, 0),
    };
  } catch (error: any) {
    // If migration hasn't run yet, avoid blocking all generation requests.
    if (error?.code === "42P01") {
      return {
        allowed: true,
        status: 200,
      };
    }

    return {
      allowed: false,
      status: 500,
      error: "Failed to validate generation limits",
    };
  }
};

export const getAiGenerationQuotaStatus = async (
  userId: string,
): Promise<AiQuotaStatus> => {
  const now = new Date();
  const dateKey = getUtcDateKey();

  try {
    const rows = await db
      .select()
      .from(UserAiGenerationLimitTable)
      .where(
        and(
          eq(UserAiGenerationLimitTable.userId, userId),
          eq(UserAiGenerationLimitTable.dateKey, dateKey),
        ),
      )
      .limit(1);

    const existing = rows[0];
    if (!existing) {
      return {
        canGenerate: true,
        remainingToday: DAILY_LIMIT,
        dailyLimit: DAILY_LIMIT,
        cooldownRemainingSeconds: 0,
      };
    }

    let cooldownRemainingSeconds = 0;
    if (existing.lastGenerationAt) {
      const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
      const elapsedMs =
        now.getTime() - new Date(existing.lastGenerationAt).getTime();
      if (elapsedMs < cooldownMs) {
        cooldownRemainingSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
      }
    }

    const remainingToday = Math.max(DAILY_LIMIT - existing.generationCount, 0);
    const canGenerate = remainingToday > 0 && cooldownRemainingSeconds <= 0;

    return {
      canGenerate,
      remainingToday,
      dailyLimit: DAILY_LIMIT,
      cooldownRemainingSeconds,
    };
  } catch (error: any) {
    // If migration hasn't run yet, don't block UI.
    if (error?.code === "42P01") {
      return {
        canGenerate: true,
        remainingToday: DAILY_LIMIT,
        dailyLimit: DAILY_LIMIT,
        cooldownRemainingSeconds: 0,
      };
    }

    return {
      canGenerate: true,
      remainingToday: DAILY_LIMIT,
      dailyLimit: DAILY_LIMIT,
      cooldownRemainingSeconds: 0,
    };
  }
};
