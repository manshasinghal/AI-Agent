import { openai } from "../../../components/lib/openai";

export async function POST(req: Request) {
  try {
    const { content, instruction, sectionTitle } = await req.json();

    if (!content?.trim() || !instruction?.trim()) {
      return Response.json(
        { error: "`content` and `instruction` are required and must be non-empty." },
        { status: 400 }
      );
    }

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI editor for a business report. You will receive a section titled \`${sectionTitle}\` and an instruction. Rewrite ONLY that section's content following the instruction. Return plain text only, no JSON, no markdown headers.`,
        },
        {
          role: "user",
          content: `Instruction: ${instruction}\nContent: ${content}`,
        },
      ],
    });

    return Response.json({
      updated: res.choices[0].message.content,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}