import { db } from "@/app/config/db";
import { usersTable } from "@/app/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const POST = async (req: NextRequest) => {
  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return new Response("Unauthorized", { status: 401 });
  }

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.primaryEmailAddress.emailAddress));
  if (users.length === 0) {
    const data = {
      name: user?.fullName || "Unnamed User",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      points: 0,
    };
    const result = await db.insert(usersTable).values(data);
    return NextResponse.json(result);
  }
  return NextResponse.json(users[0]);
};
