import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await prisma.staff.findMany({
    where: { isActive: true },
  });
  return NextResponse.json(staff);
}