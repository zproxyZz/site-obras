import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM = `Você é a IA da Obra do ObraFácil — um mestre de obras digital brasileiro.
Responda em português, de forma direta, prática e curta (preferencialmente em listas).
Domínios: construção civil, reformas, normas técnicas (ABNT/NBR), execução de serviços,
materiais, traços de concreto/argamassa, pinturas, hidráulica, elétrica residencial básica,
segurança no canteiro e estimativas de quantidades. Quando o usuário pedir cálculo,
mostre a fórmula e o resultado. Se a pergunta for fora de obra, oriente educadamente.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM,
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});