import { and, eq } from "drizzle-orm";
import { db } from "@/app/config/db";
import {
  CommunityMemberTable,
  CommunitySubjectPermissionTable,
  CommunityTable,
} from "@/app/config/schema";

export interface CommunityAccessResult {
  allowed: boolean;
  status: number;
  error?: string;
}

const ADMIN_ROLES = new Set(["owner", "admin", "subject-admin"]);

export const ensureCommunityGenerationAccess = async (
  userId: string,
  communityId: number | undefined,
  subject: string,
): Promise<CommunityAccessResult> => {
  if (!communityId) {
    return { allowed: true, status: 200 };
  }

  try {
    const communities = await db
      .select()
      .from(CommunityTable)
      .where(eq(CommunityTable.id, communityId))
      .limit(1);

    const community = communities[0];
    if (!community) {
      return {
        allowed: false,
        status: 404,
        error: "Community not found",
      };
    }

    if (community.aiGenerationEnabled !== 1) {
      return {
        allowed: false,
        status: 403,
        error: "AI generation is disabled for this community",
      };
    }

    if (community.ownerUserId === userId) {
      return { allowed: true, status: 200 };
    }

    const members = await db
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

    const member = members[0];
    if (!member) {
      return {
        allowed: false,
        status: 403,
        error: "You are not an active member of this community",
      };
    }

    if (!ADMIN_ROLES.has(member.role)) {
      return {
        allowed: false,
        status: 403,
        error: "Only community admins can generate questions",
      };
    }

    if (member.role === "admin") {
      return { allowed: true, status: 200 };
    }

    const permissions = await db
      .select()
      .from(CommunitySubjectPermissionTable)
      .where(
        and(
          eq(CommunitySubjectPermissionTable.communityId, communityId),
          eq(CommunitySubjectPermissionTable.userId, userId),
          eq(CommunitySubjectPermissionTable.subject, subject),
        ),
      )
      .limit(1);

    const permission = permissions[0];
    if (!permission || permission.canGenerateAi !== 1) {
      return {
        allowed: false,
        status: 403,
        error: `No AI generation permission for subject: ${subject}`,
      };
    }

    return { allowed: true, status: 200 };
  } catch (error: any) {
    // Table might not exist yet in local env before migration.
    if (error?.code === "42P01") {
      return { allowed: true, status: 200 };
    }

    return {
      allowed: false,
      status: 500,
      error: "Failed to validate community access",
    };
  }
};
