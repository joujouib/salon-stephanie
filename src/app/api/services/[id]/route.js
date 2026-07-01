import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// PATCH — update a service, or toggle active (admin only)
export async function PATCH(request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Build only the fields provided
  const data = {};
  if (body.name != null) data.name = body.name;
  if (body.category != null) data.category = body.category;
  if (body.priceMin != null) data.priceMin = Number(body.priceMin);
  if (body.priceMax != null) data.priceMax = Number(body.priceMax);
  if (body.duration != null) data.duration = Number(body.duration);
  if (body.isActive != null) data.isActive = body.isActive;

  const service = await prisma.service.update({
    where: { id },
    data,
  });

  return NextResponse.json(service);
}