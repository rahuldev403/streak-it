import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAiGenerationQuotaStatus } from "@/lib/ai-rate-limit";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await getAiGenerationQuotaStatus(user.id);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("Error fetching AI quota status:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI quota status" },
      { status: 500 },
    );
  }
}
