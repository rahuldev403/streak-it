import crypto from "crypto";
import OpenAI from "openai";
import { db } from "@/app/config/db";
import { UserAiProviderTable } from "@/app/config/schema";
import { eq } from "drizzle-orm";

export type ProviderMode = "platform" | "user";

interface ProviderResolveResult {
  success: boolean;
  status: number;
  mode: ProviderMode;
  apiKey?: string;
  message?: string;
}

const getBaseUrl = () =>
  process.env.GEMINI_BASE_URL ||
  "https://generativelanguage.googleapis.com/v1beta/openai";

const getModel = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

const getEncryptionKey = () => {
  const secret = process.env.USER_API_KEY_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("USER_API_KEY_ENCRYPTION_SECRET is not configured");
  }

  return crypto.createHash("sha256").update(secret).digest();
};

export const maskApiKey = (apiKey: string) => {
  if (apiKey.length <= 8) {
    return "****";
  }

  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
};

export const encryptApiKey = (apiKey: string) => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(apiKey, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();
  const keyFingerprint = crypto
    .createHash("sha256")
    .update(apiKey)
    .digest("hex")
    .slice(0, 32);

  return {
    encryptedApiKey: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    keyFingerprint,
    maskedKey: maskApiKey(apiKey),
  };
};

export const decryptApiKey = (payload: {
  encryptedApiKey: string;
  iv: string;
  authTag: string;
}) => {
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(payload.iv, "base64"),
  );

  decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.encryptedApiKey, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};

export const validateGeminiApiKey = async (apiKey: string) => {
  try {
    const client = new OpenAI({
      apiKey,
      baseURL: getBaseUrl(),
    });

    const completion = await client.chat.completions.create({
      model: getModel(),
      messages: [{ role: "user", content: "Reply with exactly OK" }],
      max_tokens: 8,
      temperature: 0,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    return {
      valid: Boolean(text),
      message: text ? "API key validated" : "Unexpected model response",
    };
  } catch (error: any) {
    return {
      valid: false,
      message:
        error?.message ||
        "Could not validate key. Check key and Gemini API access.",
    };
  }
};

export const getUserAiSettings = async (userId: string) => {
  try {
    const rows = await db
      .select()
      .from(UserAiProviderTable)
      .where(eq(UserAiProviderTable.userId, userId))
      .limit(1);

    return rows[0] || null;
  } catch (error: any) {
    // Table may not exist yet if migrations haven't been applied.
    if (error?.code === "42P01") {
      return null;
    }
    throw error;
  }
};

export const resolveGeminiApiKey = async (
  userId: string,
  requestedMode?: ProviderMode,
): Promise<ProviderResolveResult> => {
  const settings = await getUserAiSettings(userId);
  const mode = (requestedMode ||
    settings?.providerMode ||
    "platform") as ProviderMode;

  if (mode === "platform") {
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        status: 500,
        mode,
        message: "Platform GEMINI_API_KEY is not configured",
      };
    }

    return {
      success: true,
      status: 200,
      mode,
      apiKey: process.env.GEMINI_API_KEY,
    };
  }

  if (!settings?.encryptedApiKey || !settings?.iv || !settings?.authTag) {
    return {
      success: false,
      status: 400,
      mode,
      message:
        "No personal Gemini API key found. Add your key or switch to platform mode.",
    };
  }

  try {
    const apiKey = decryptApiKey({
      encryptedApiKey: settings.encryptedApiKey,
      iv: settings.iv,
      authTag: settings.authTag,
    });

    return {
      success: true,
      status: 200,
      mode,
      apiKey,
    };
  } catch {
    return {
      success: false,
      status: 500,
      mode,
      message: "Failed to decrypt stored API key",
    };
  }
};
