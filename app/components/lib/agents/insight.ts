import { openai } from "../openai";

interface InsightResult {
  problemBreakdown: string;
  stakeholders: string[];
  risks: string[];
  reasoning: string;
}

export async function insightAgent(input: any): Promise<InsightResult> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an Insight Agent. Given a planner's JSON, enrich it by adding `risks` (string[]) and `reasoning` (string). Return valid JSON only.",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const raw = res.choices[0].message.content!;

  try {
    return JSON.parse(raw) as InsightResult;
  } catch (err) {
    throw new Error(
      `InsightAgent: Failed to parse model response as JSON.\nRaw response: "${raw}"\nOriginal error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}