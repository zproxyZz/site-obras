import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM = `Você é um mestre de obras brasileiro escrevendo tutoriais práticos
para o app ObraFácil. Responda APENAS em markdown, em português, e siga rigorosamente
esta estrutura, sem texto antes ou depois:

# {Título curto do tutorial}

**Dificuldade:** Fácil | Média | Difícil
**Tempo estimado:** {tempo}
**Categoria:** {Hidráulica | Elétrica | Pintura | Alvenaria | Acabamento | Outros}

## Materiais
- item 1
- item 2

## Ferramentas
- item 1
- item 2

## Passo a passo
1. ...
2. ...
3. ...

## Dicas do mestre
- ...
- ...

## Segurança
- ...

Seja direto, use medidas em unidades brasileiras (m, cm, kg, L, sacos 50kg).
Se a pergunta não for de obra, recuse educadamente em uma frase.`;

export const Route = createFileRoute("/api/tutorial")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { topic } = (await request.json()) as { topic?: string };
        if (!topic || !topic.trim()) {
          return new Response("topic required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const { text } = await generateText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM,
          prompt: `Tópico: ${topic.trim()}`,
        });
        return Response.json({ markdown: text });
      },
    },
  },
});