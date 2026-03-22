import { openai } from "../openai";

interface PlannerResult {
  problemBreakdown: string;
  stakeholders: string[];
}

export async function plannerAgent(problem: string): Promise<PlannerResult> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a Planner Agent. Respond ONLY with valid JSON with keys `problemBreakdown` (string) and `stakeholders` (string array). No markdown, no explanation.",
      },
      {
        role: "user",
        content: `Break this into:
        - Problem Breakdown
        - Stakeholders
        
        Problem: ${problem}`,
      },
    ],
  });

  const raw = res.choices[0].message.content!;

  try {
    return JSON.parse(raw) as PlannerResult;
  } catch (err) {
    throw new Error(
      `PlannerAgent: Failed to parse model response as JSON.\nRaw response: "${raw}"\nOriginal error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}