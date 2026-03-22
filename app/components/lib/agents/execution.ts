import { openai } from "../openai";

interface ExecutionResult {
  problemBreakdown: string;
  stakeholders: string;
  solutionApproach: string;
  actionPlan: string;
}

// Mirrors the normaliseField logic in page.tsx — keeps the agent
// self-contained without importing from the frontend.
function flattenToString(value: unknown): string {
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (typeof item === "string") return `${index + 1}. ${item}`;
        if (typeof item === "object" && item !== null) {
          const fields = Object.entries(item as Record<string, unknown>)
            .map(([key, val]) => {
              const label = key.charAt(0).toUpperCase() + key.slice(1);
              return `${label}: ${flattenToString(val)}`;
            })
            .join(" | ");
          return `${index + 1}. ${fields}`;
        }
        return `${index + 1}. ${String(item)}`;
      })
      .join("\n");
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return `${label}: ${flattenToString(val)}`;
      })
      .join("\n");
  }

  return String(value);
}

export async function executionAgent(input: any): Promise<ExecutionResult> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an Execution Agent. Given enriched analysis, produce a final report JSON with exactly these four keys, ALL must be plain strings:

- "problemBreakdown": a detailed paragraph describing the problem.
- "stakeholders": a plain string listing stakeholders separated by commas or newlines. NOT an array.
- "solutionApproach": a detailed paragraph describing the solution.
- "actionPlan": a single string of numbered steps separated by newlines. Example: "1. Do X\n2. Do Y\n3. Do Z". NOT an array or object.

Do NOT use arrays, nested objects, or any non-string values for any field. Every value must be typeof string.`,
      },
      {
        role: "user",
        content: `Create a detailed professional report with these sections:
- problemBreakdown
- stakeholders
- solutionApproach
- actionPlan

All values must be plain strings. For actionPlan, write numbered steps as a single string separated by newlines (e.g. "1. Do X\n2. Do Y"). Do NOT return arrays or objects for any field.

Input: ${JSON.stringify(input)}`,
      },
    ],
  });

  const raw = res.choices[0].message.content!;

  try {
    const result = JSON.parse(raw);

    // Runtime assertions — flatten any field the model returned as a non-string
    // regardless of prompt instructions, so the orchestrator always gets clean strings.
    if (typeof result.actionPlan !== "string") {
      console.warn("ExecutionAgent: actionPlan was not a string, flattening:", typeof result.actionPlan);
      result.actionPlan = flattenToString(result.actionPlan);
    }

    if (typeof result.stakeholders !== "string") {
      console.warn("ExecutionAgent: stakeholders was not a string, flattening:", typeof result.stakeholders);
      result.stakeholders = flattenToString(result.stakeholders);
    }

    if (typeof result.problemBreakdown !== "string") {
      result.problemBreakdown = flattenToString(result.problemBreakdown);
    }

    if (typeof result.solutionApproach !== "string") {
      result.solutionApproach = flattenToString(result.solutionApproach);
    }

    return result as ExecutionResult;
  } catch (err) {
    throw new Error(
      `ExecutionAgent: Failed to parse model response as JSON.\nRaw response: "${raw}"\nOriginal error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}