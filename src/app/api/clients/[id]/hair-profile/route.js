import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// PUT /api/clients/[id]/hair-profile — upsert the client's hair profile
export async function PUT(request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // naturalLevel: optional; must be an integer 1–10 when provided
  let naturalLevel = null;
  if (body.naturalLevel != null && body.naturalLevel !== "") {
    const n = Number(body.naturalLevel);
    if (!Number.isInteger(n) || n < 1 || n > 10) {
      return NextResponse.json(
        { error: "naturalLevel must be an integer between 1 and 10" },
        { status: 400 }
      );
    }
    naturalLevel = n;
  }

  // Normalize text fields: empty string → null
  const clean = (v) => (v != null && String(v).trim() !== "" ? String(v).trim() : null);

  const fields = {
    naturalLevel,
    thickness: clean(body.thickness),
    porosity: clean(body.porosity),
    treatments: clean(body.treatments),
    allergies: clean(body.allergies),
    notes: clean(body.notes),
  };

  const profile = await prisma.clientHairProfile.upsert({
    where: { clientId: id },
    create: { clientId: id, ...fields },
    update: { ...fields },
  });

  return NextResponse.json(profile);
}
