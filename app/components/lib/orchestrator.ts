import { plannerAgent } from "./agents/planner";
import { insightAgent } from "./agents/insight";
import { executionAgent } from "./agents/execution";

export interface ReportData {
  problemBreakdown: string;
  stakeholders: string;
  solutionApproach: string;
  actionPlan: string;
}

export async function runAgent(problem: string): Promise<ReportData> {
  const planner = await plannerAgent(problem);
  const insight = await insightAgent(planner);
  const execution = await executionAgent(insight);

  return execution;
}