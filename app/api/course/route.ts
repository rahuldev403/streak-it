import { db } from "@/app/config/db";
import { CourseTable } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const result = await db.select().from(CourseTable);
  return NextResponse.json(result);
};
