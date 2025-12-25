import { db } from "@/app/config/db";
import { usersTable } from "@/app/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!isAdmin(userEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Admin privileges required.",
        },
        { status: 403 }
      );
    }

    const { email, subscription } = await req.json();

    if (!email || !subscription) {
      return NextResponse.json(
        { success: false, message: "Email and subscription are required" },
        { status: 400 }
      );
    }

    // Get user from Clerk by email
    const client = await clerkClient();
    const users = await client.users.getUserList({ emailAddress: [email] });

    if (users.data.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const targetUser = users.data[0];

    // Update user metadata in Clerk
    await client.users.updateUserMetadata(targetUser.id, {
      publicMetadata: {
        plan: subscription,
      },
    });

    // Update or insert in database
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      await db
        .update(usersTable)
        .set({ subscription })
        .where(eq(usersTable.email, email));
    } else {
      await db.insert(usersTable).values({
        email,
        name: targetUser.firstName || email,
        subscription,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Subscription updated to ${subscription} for ${email}`,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update subscription",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
