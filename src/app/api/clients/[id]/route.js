import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET /api/clients/[id] — one client with hair profile + formula history
export async function GET(request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      hairProfile: true,
      formulas: { orderBy: { performedAt: "desc" } },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(client);
}

// PATCH /api/clients/[id] — update client basics (name, phone, language)
export async function PATCH(request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const data = {};
  if (body.name != null) {
    if (!body.name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    data.name = body.name.trim();
  }
  if (body.phone != null) data.phone = body.phone.trim() || null;
  if (body.language != null) data.language = body.language;

  // Warn (not block) when renaming onto another client's name. The client can
  // re-send with force:true to save anyway. Same soft-warning idea as creation.
  if (data.name && !body.force) {
    const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, " ");
    const target = normalize(data.name);
    const others = await prisma.client.findMany({ where: { id: { not: id } } });
    if (others.some((o) => normalize(o.name) === target)) {
      return NextResponse.json(
        { error: "Another client already has this name.", duplicate: true },
        { status: 409 }
      );
    }
  }

  const client = await prisma.client.update({
    where: { id },
    data,
  });

  return NextResponse.json(client);
}
