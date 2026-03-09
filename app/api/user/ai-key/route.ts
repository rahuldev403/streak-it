import { db } from "@/app/config/db";
import { UserAiProviderTable } from "@/app/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  encryptApiKey,
  getUserAiSettings,
  validateGeminiApiKey,
} from "@/lib/gemini-provider";

const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) return null;
  return user;
};

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getUserAiSettings(user.id);

    return NextResponse.json({
      success: true,
      mode: settings?.providerMode || "platform",
      hasUserKey: Boolean(settings?.encryptedApiKey),
      maskedKey: settings?.maskedKey || null,
      lastValidatedAt: settings?.lastValidatedAt || null,
    });
  } catch (error: any) {
    console.error("Error fetching AI key settings:", error);

    // Graceful fallback when user_ai_provider table isn't migrated yet.
    if (error?.code === "42P01") {
      return NextResponse.json({
        success: true,
        mode: "platform",
        hasUserKey: false,
        maskedKey: null,
        lastValidatedAt: null,
        warning:
          "AI key table not found yet. Run migrations to enable personal key storage.",
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch AI key settings" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { apiKey, mode } = await req.json();

    const providerMode = mode === "user" ? "user" : "platform";
    const now = new Date().toISOString();

    const existing = await getUserAiSettings(user.id);

    if (providerMode === "user" && !apiKey && !existing?.encryptedApiKey) {
      return NextResponse.json(
        {
          error:
            "Personal mode requires a valid Gemini API key. Save your key first.",
        },
        { status: 400 },
      );
    }

    let payload: Record<string, any> = {
      providerMode,
      updatedAt: now,
    };

    if (apiKey) {
      const trimmed = String(apiKey).trim();
      if (trimmed.length < 20) {
        return NextResponse.json(
          { error: "API key looks invalid. Please check and try again." },
          { status: 400 },
        );
      }

      const validation = await validateGeminiApiKey(trimmed);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.message || "Invalid API key" },
          { status: 400 },
        );
      }

      payload = {
        ...payload,
        ...encryptApiKey(trimmed),
        lastValidatedAt: now,
      };
    }

    if (!existing) {
      await db.insert(UserAiProviderTable).values({
        userId: user.id,
        providerMode,
        encryptedApiKey: (payload.encryptedApiKey as string) || null,
        iv: (payload.iv as string) || null,
        authTag: (payload.authTag as string) || null,
        maskedKey: (payload.maskedKey as string) || null,
        keyFingerprint: (payload.keyFingerprint as string) || null,
        lastValidatedAt: (payload.lastValidatedAt as string) || null,
        updatedAt: now,
      });
    } else {
      await db
        .update(UserAiProviderTable)
        .set(payload)
        .where(eq(UserAiProviderTable.userId, user.id));
    }

    return NextResponse.json({
      success: true,
      message: apiKey
        ? "Gemini API key saved successfully"
        : "AI provider mode updated",
    });
  } catch (error: any) {
    console.error("Error saving AI key settings:", error);

    if (error?.code === "42P01") {
      return NextResponse.json(
        {
          error:
            "Personal key storage is not ready yet. Please run database migrations first.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to save AI key settings" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .delete(UserAiProviderTable)
      .where(and(eq(UserAiProviderTable.userId, user.id)));

    return NextResponse.json({
      success: true,
      message: "Personal API key removed. Mode reset to platform.",
    });
  } catch (error: any) {
    console.error("Error deleting AI key settings:", error);

    if (error?.code === "42P01") {
      return NextResponse.json(
        {
          error:
            "Personal key storage is not ready yet. Please run database migrations first.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete AI key settings" },
      { status: 500 },
    );
  }
}
