import { runAgent } from "../../../components/lib/orchestrator";

export async function POST(req: Request) {
  try {
    const { problem } = await req.json();

    const result = await runAgent(problem);

    return Response.json(result);
  } catch (error: any) {
    console.error(error);

    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}