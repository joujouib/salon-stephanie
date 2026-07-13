import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callLLM } from "@/lib/llm";

export async function POST(request) {
  // Admin only — this feature costs money (eventually) and is for staff
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { inputs, result } = body;

  // Validate: we need both the case and the computed result
  if (!inputs || !result) {
    return NextResponse.json(
      { error: "inputs and result are required" },
      { status: 400 }
    );
  }

  const system = `You are a professional hair colorist assistant inside a salon's internal tool.
A rule-based calculator has ALREADY determined the correct formulation. Your ONLY job is to explain its reasoning in clear, warm, professional language for the salon owner.

STRICT RULES:
- NEVER contradict, change, or "improve" the computed result. It is correct.
- NEVER invent numbers (developer volumes, ratios, timings) that are not in the provided result.
- If the result contains warnings, treat them as the most important part of your explanation.
- Explain WHY: reference lift levels, what pigment gets exposed when lifting, why the neutralizing tone cancels it, and why the developer strength fits.
- Maximum 120 words total. One or two SHORT paragraphs. No headings, no lists, no markdown.
- Never introduce yourself, never say "as a professional" or similar meta-phrases — just speak naturally, colleague to colleague.
- Say each point once. No restating, no closing summary sentence `;
  const user = `Explain this case to the salon owner.

CLIENT SITUATION:
- Current level: ${inputs.currentLevel}
- Target level: ${inputs.targetLevel}
- Hair status: ${inputs.hairStatus}
- Hair condition: ${inputs.hairCondition}
- Desired tone: ${inputs.desiredTone}

COMPUTED RESULT (authoritative — explain it, never change it):
${JSON.stringify(result, null, 2)}`;

  try {
    const explanation = await callLLM({ system, user, maxTokens: 400 });
    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("LLM explanation failed:", err);
    return NextResponse.json(
      { error: "Could not generate an explanation right now." },
      { status: 502 }
    );
  }
}