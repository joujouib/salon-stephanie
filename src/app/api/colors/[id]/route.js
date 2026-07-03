import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// PATCH — update a color or toggle active (admin only)
export async function PATCH(request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const data = {};
  if (body.name != null) data.name = body.name;
  if (body.hex != null) data.hex = body.hex;
  if (body.category != null) data.category = body.category;
  if (body.undertone != null) data.undertone = body.undertone;
  if (body.lighteningLevel != null) data.lighteningLevel = body.lighteningLevel;
  if (body.suitableFor != null) data.suitableFor = body.suitableFor;
  if (body.isActive != null) data.isActive = body.isActive;
  const color = await prisma.color.update({
    where: { id },
    data,
  });

  return NextResponse.json(color);
}