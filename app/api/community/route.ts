import { db } from "@/app/config/db";
import { CommunityMemberTable, CommunityTable } from "@/app/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await db
      .select()
      .from(CommunityMemberTable)
      .where(
        and(
          eq(CommunityMemberTable.userId, user.id),
          eq(CommunityMemberTable.status, "active"),
        ),
      );

    const communityIds = memberships.map((m) => m.communityId);
    if (communityIds.length === 0) {
      return NextResponse.json({ success: true, communities: [] });
    }

    const communities = await db.select().from(CommunityTable);
    const visible = communities.filter((c) => communityIds.includes(c.id));

    return NextResponse.json({
      success: true,
      communities: visible,
    });
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug, adminSeatsPurchased = 1 } = await req.json();

    if (!name || String(name).trim().length < 3) {
      return NextResponse.json(
        { error: "Community name must be at least 3 characters" },
        { status: 400 },
      );
    }

    const generatedSlug = slugify(slug || name);
    if (!generatedSlug) {
      return NextResponse.json(
        { error: "Invalid community slug" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    const [community] = await db
      .insert(CommunityTable)
      .values({
        name: String(name).trim(),
        slug: generatedSlug,
        ownerUserId: user.id,
        adminSeatsPurchased: Math.max(Number(adminSeatsPurchased) || 1, 1),
        aiGenerationEnabled: 1,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await db.insert(CommunityMemberTable).values({
      communityId: community.id,
      userId: user.id,
      role: "owner",
      seatType: "admin",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      community,
      message: "Community created successfully",
    });
  } catch (error: any) {
    console.error("Error creating community:", error);
    return NextResponse.json(
      {
        error:
          error?.code === "23505"
            ? "Community slug already exists"
            : "Failed to create community",
      },
      { status: 500 },
    );
  }
}
