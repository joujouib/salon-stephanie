import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let settings = await prisma.salonSettings.findFirst();
  if (!settings) {
    settings = await prisma.salonSettings.create({ data: { activeStaffCount: 3 } });
  }

  return NextResponse.json(settings);
}

export async function PATCH(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { activeStaffCount } = body;

  if (
    !Number.isInteger(activeStaffCount) ||
    activeStaffCount < 1 ||
    activeStaffCount > 10
  ) {
    return NextResponse.json(
      { error: "activeStaffCount must be an integer between 1 and 10" },
      { status: 400 }
    );
  }

  const existing = await prisma.salonSettings.findFirst();

  const settings = existing
    ? await prisma.salonSettings.update({
        where: { id: existing.id },
        data: { activeStaffCount },
      })
    : await prisma.salonSettings.create({
        data: { activeStaffCount },
      });

  return NextResponse.json(settings);
}
