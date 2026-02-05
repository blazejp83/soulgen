import { streamText, type ModelMessage } from "ai";
import { getModel } from "@/lib/providers";
import type { Provider } from "@/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { provider, apiKey, model, messages, system } = body as {
      provider?: Provider;
      apiKey?: string;
      model?: string;
      messages?: ModelMessage[];
      system?: string;
    };

    // Validate required fields
    if (!provider || !apiKey || !model || !messages) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: provider, apiKey, model, messages",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = streamText({
      model: getModel(provider, apiKey, model),
      messages,
      ...(system ? { system } : {}),
    });

    return (await result).toTextStreamResponse();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Never expose the API key in error responses
    const safeMessage = message.replace(
      /sk-[a-zA-Z0-9_-]+/g,
      "[REDACTED_KEY]"
    );

    return new Response(JSON.stringify({ error: safeMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
