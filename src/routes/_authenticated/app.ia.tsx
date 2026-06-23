import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/ia")({
  head: () => ({ meta: [{ title: "IA da Obra · ObraFácil" }] }),
  component: IAChat,
});

const SUGGESTIONS = [
  "Quantos sacos de cimento para 10m² de contrapiso?",
  "Traço de argamassa para assentar tijolo",
  "Diferença entre tinta acrílica e PVA",
  "Como calcular m² de azulejo com perda",
];

const transport = new DefaultChatTransport({ api: "/api/chat" });

function IAChat() {
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status } = useChat({
    id: "obra-ia",
    transport,
    onError: (e) => toast.error(e.message),
  });
  const loading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    setInput("");
    await sendMessage({ text: t });
  }

  return (
    <div className="space-y-4">
      <SectionHeading eyebrow="Inteligência" title="IA da Obra" meta="Mestre digital" />

      <div
        ref={scroller}
        className="ledger-card rounded-sm p-4 min-h-[55vh] max-h-[60vh] overflow-y-auto space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center py-6">
            <div className="size-12 mx-auto grid place-items-center bg-terracotta/15 rounded-sm">
              <Sparkles className="size-5 text-terracotta" />
            </div>
            <p className="font-display text-lg mt-3">Pergunte qualquer coisa</p>
            <p className="text-xs text-ink/60 mt-1">
              Cálculos, traços, normas, dúvidas de execução.
            </p>
            <div className="grid gap-2 mt-5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs border border-ink/15 rounded-sm px-3 py-2 hover:bg-terracotta/10 hover:border-terracotta/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m: UIMessage) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-sm text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "bg-ink text-paper"
                      : "bg-paper-soft border border-ink/15"
                  }`}
                >
                  {text || (loading ? "…" : "")}
                </div>
              </div>
            );
          })
        )}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-ink/55 text-xs font-mono">
            <Loader2 className="size-3 animate-spin" /> pensando…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex.: como calcular concreto para uma laje 4x5m?"
          className="flex-1 bg-paper border-2 border-ink rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="size-11 grid place-items-center bg-terracotta text-paper rounded-sm shadow-[3px_3px_0_0_var(--ink)] disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}