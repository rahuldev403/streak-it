import { db } from "@/app/config/db";
import {
  CommunityMemberTable,
  CommunitySubjectPermissionTable,
  CommunityTable,
} from "@/app/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROLES = new Set(["owner", "admin"]);

const isCommunityOwnerOrAdmin = async (communityId: number, userId: string) => {
  const communityRows = await db
    .select()
    .from(CommunityTable)
    .where(eq(CommunityTable.id, communityId))
    .limit(1);

  const community = communityRows[0];
  if (!community) return false;
  if (community.ownerUserId === userId) return true;

  const memberRows = await db
    .select()
    .from(CommunityMemberTable)
    .where(
      and(
        eq(CommunityMemberTable.communityId, communityId),
        eq(CommunityMemberTable.userId, userId),
        eq(CommunityMemberTable.status, "active"),
      ),
    )
    .limit(1);

  return Boolean(memberRows[0] && ADMIN_ROLES.has(memberRows[0].role));
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { communityId } = await params;
    const parsedCommunityId = Number(communityId);
    if (!Number.isFinite(parsedCommunityId)) {
      return NextResponse.json(
        { error: "Invalid communityId" },
        { status: 400 },
      );
    }

    const allowed = await isCommunityOwnerOrAdmin(parsedCommunityId, user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: "Only community admins can view members" },
        { status: 403 },
      );
    }

    const members = await db
      .select()
      .from(CommunityMemberTable)
      .where(eq(CommunityMemberTable.communityId, parsedCommunityId));

    const permissions = await db
      .select()
      .from(CommunitySubjectPermissionTable)
      .where(
        eq(CommunitySubjectPermissionTable.communityId, parsedCommunityId),
      );

    return NextResponse.json({ success: true, members, permissions });
  } catch (error) {
    console.error("Error fetching community members:", error);
    return NextResponse.json(
      { error: "Failed to fetch community members" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { communityId } = await params;
    const parsedCommunityId = Number(communityId);
    if (!Number.isFinite(parsedCommunityId)) {
      return NextResponse.json(
        { error: "Invalid communityId" },
        { status: 400 },
      );
    }

    const allowed = await isCommunityOwnerOrAdmin(parsedCommunityId, user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: "Only community admins can add members" },
        { status: 403 },
      );
    }

    const {
      memberUserId,
      role = "subject-admin",
      seatType = "admin",
      subjects = [],
    } = await req.json();

    if (!memberUserId || typeof memberUserId !== "string") {
      return NextResponse.json(
        { error: "memberUserId is required" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    const existingRows = await db
      .select()
      .from(CommunityMemberTable)
      .where(
        and(
          eq(CommunityMemberTable.communityId, parsedCommunityId),
          eq(CommunityMemberTable.userId, memberUserId),
        ),
      )
      .limit(1);

    if (existingRows[0]) {
      await db
        .update(CommunityMemberTable)
        .set({
          role,
          seatType,
          status: "active",
          updatedAt: now,
        })
        .where(eq(CommunityMemberTable.id, existingRows[0].id));
    } else {
      await db.insert(CommunityMemberTable).values({
        communityId: parsedCommunityId,
        userId: memberUserId,
        role,
        seatType,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const subject of subjects as string[]) {
      const permissionRows = await db
        .select()
        .from(CommunitySubjectPermissionTable)
        .where(
          and(
            eq(CommunitySubjectPermissionTable.communityId, parsedCommunityId),
            eq(CommunitySubjectPermissionTable.userId, memberUserId),
            eq(CommunitySubjectPermissionTable.subject, subject),
          ),
        )
        .limit(1);

      if (permissionRows[0]) {
        await db
          .update(CommunitySubjectPermissionTable)
          .set({
            canGenerateAi: 1,
            canGenerateManual: 1,
            updatedAt: now,
          })
          .where(eq(CommunitySubjectPermissionTable.id, permissionRows[0].id));
      } else {
        await db.insert(CommunitySubjectPermissionTable).values({
          communityId: parsedCommunityId,
          userId: memberUserId,
          subject,
          canGenerateAi: 1,
          canGenerateManual: 1,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Community member saved successfully",
    });
  } catch (error) {
    console.error("Error saving community member:", error);
    return NextResponse.json(
      { error: "Failed to save community member" },
      { status: 500 },
    );
  }
}
