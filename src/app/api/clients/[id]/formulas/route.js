import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const RATINGS = ["perfect", "go_darker", "go_lighter"];

// POST /api/clients/[id]/formulas — add a formula record to the client's history
export async function POST(request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Normalize text fields: empty string → null
  const clean = (v) => (v != null && String(v).trim() !== "" ? String(v).trim() : null);

  const colorCode = clean(body.colorCode);
  const brand = clean(body.brand);
  const developerVol = clean(body.developerVol);
  const mixRatio = clean(body.mixRatio);
  const notes = clean(body.notes);

  // processingMins: optional; positive integer when provided
  let processingMins = null;
  if (body.processingMins != null && body.processingMins !== "") {
    const n = Number(body.processingMins);
    if (!Number.isInteger(n) || n <= 0) {
      return NextResponse.json(
        { error: "processingMins must be a positive integer" },
        { status: 400 }
      );
    }
    processingMins = n;
  }

  // rating: optional; must be one of the allowed values when provided
  let rating = null;
  if (body.rating != null && body.rating !== "") {
    if (!RATINGS.includes(body.rating)) {
      return NextResponse.json(
        { error: "rating must be one of: perfect, go_darker, go_lighter" },
        { status: 400 }
      );
    }
    rating = body.rating;
  }

  // Reject a fully-empty record — at least one field must be present
  const hasSomething =
    colorCode || brand || developerVol || mixRatio || notes || processingMins != null || rating;
  if (!hasSomething) {
    return NextResponse.json(
      { error: "Please fill in at least one field." },
      { status: 400 }
    );
  }

  const formula = await prisma.clientFormula.create({
    data: {
      clientId: id,
      colorCode,
      brand,
      developerVol,
      mixRatio,
      processingMins,
      notes,
      rating,
    },
  });

  return NextResponse.json(formula, { status: 201 });
}
