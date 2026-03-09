import { isSuperAdmin } from "@/lib/admin";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

interface ManageAdminRequest {
  email?: string;
  makeAdmin?: boolean;
}

interface ListedAdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdminFromMetadata: boolean;
  isSuperAdmin: boolean;
}

const normalizeUserList = (result: unknown) => {
  if (Array.isArray(result)) return result;

  if (
    result &&
    typeof result === "object" &&
    "data" in result &&
    Array.isArray((result as { data?: unknown[] }).data)
  ) {
    return (result as { data: unknown[] }).data;
  }

  return [];
};

const requireSuperAdmin = async () => {
  const actor = await currentUser();
  if (!actor) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const actorEmail = actor.primaryEmailAddress?.emailAddress;
  if (!isSuperAdmin(actorEmail)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Access denied. Super admin privileges required." },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const };
};

export async function GET() {
  try {
    const auth = await requireSuperAdmin();
    if (!auth.ok) return auth.response;

    const client = await clerkClient();
    const result = await client.users.getUserList({ limit: 100 });
    const users = normalizeUserList(result) as Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      publicMetadata?: Record<string, unknown>;
      emailAddresses?: Array<{ emailAddress?: string }>;
    }>;

    const adminUsers: ListedAdminUser[] = users
      .map((user) => {
        const email = String(user.emailAddresses?.[0]?.emailAddress || "")
          .trim()
          .toLowerCase();
        const isAdminFromMetadata = user.publicMetadata?.isAdmin === true;
        const superAdmin = isSuperAdmin(email);

        return {
          id: user.id,
          email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdminFromMetadata,
          isSuperAdmin: superAdmin,
        };
      })
      .filter(
        (user) => user.email && (user.isAdminFromMetadata || user.isSuperAdmin),
      )
      .sort((a, b) => a.email.localeCompare(b.email));

    return NextResponse.json({
      success: true,
      count: adminUsers.length,
      users: adminUsers,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin users." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (!auth.ok) return auth.response;

    const body = (await req.json()) as ManageAdminRequest;
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const makeAdmin = body.makeAdmin !== false;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid user email is required." },
        { status: 400 },
      );
    }

    const client = await clerkClient();
    const result = await client.users.getUserList({
      emailAddress: [email],
      limit: 1,
    });

    const users = normalizeUserList(result) as Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      publicMetadata?: Record<string, unknown>;
      emailAddresses?: Array<{ emailAddress?: string }>;
    }>;

    const targetUser = users[0];
    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const currentMetadata = targetUser.publicMetadata || {};

    await client.users.updateUserMetadata(targetUser.id, {
      publicMetadata: {
        ...currentMetadata,
        isAdmin: makeAdmin,
      },
    });

    const targetEmail = targetUser.emailAddresses?.[0]?.emailAddress || email;

    return NextResponse.json({
      success: true,
      message: makeAdmin
        ? `Admin access granted to ${targetEmail}`
        : `Admin access removed from ${targetEmail}`,
      user: {
        id: targetUser.id,
        email: targetEmail,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        isAdmin: makeAdmin,
      },
    });
  } catch (error) {
    console.error("Error updating admin role:", error);
    return NextResponse.json(
      {
        error: "Failed to update user admin access.",
      },
      { status: 500 },
    );
  }
}
