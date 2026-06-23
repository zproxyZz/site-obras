import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { useEffect, useState } from "react";
import { BookOpen, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/tutoriais")({
  head: () => ({ meta: [{ title: "Tutoriais · ObraFácil" }] }),
  component: Tutoriais,
});

type Tutorial = {
  id: string;
  topic: string;
  markdown: string;
  created_at: number;
};

const STORAGE = "obrafacil:tutoriais";
const SUGGESTIONS = [
  "Trocar fechadura de porta",
  "Assentar porcelanato 60x60",
  "Instalar chuveiro elétrico",
  "Pintar parede sem manchar",
  "Rejuntar piso de banheiro",
  "Furar parede sem rachar",
];

function Tutoriais() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Tutorial[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  function persist(next: Tutorial[]) {
    setItems(next);
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  async function generate(t: string) {
    const term = t.trim();
    if (!term || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tutorial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic: term }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { markdown } = (await res.json()) as { markdown: string };
      const next: Tutorial = {
        id: crypto.randomUUID(),
        topic: term,
        markdown,
        created_at: Date.now(),
      };
      persist([next, ...items]);
      setActive(next.id);
      setTopic("");
    } catch (e) {
      toast.error((e as Error).message || "Falha ao gerar tutorial");
    } finally {
      setLoading(false);
    }
  }

  function remove(id: string) {
    persist(items.filter((i) => i.id !== id));
    if (active === id) setActive(null);
  }

  const current = items.find((i) => i.id === active);

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Conteúdo"
        title="Tutoriais"
        meta="Gerados por IA"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          generate(topic);
        }}
        className="ledger-card rounded-sm p-3 space-y-2"
      >
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Digite o que quer aprender…"
          className="w-full bg-paper border-2 border-ink rounded-sm px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="w-full inline-flex items-center justify-center gap-2 bg-terracotta text-paper py-2.5 rounded-sm font-mono text-xs uppercase tracking-[0.2em] font-bold shadow-[3px_3px_0_0_var(--ink)] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> gerando…
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Gerar com IA
            </>
          )}
        </button>
      </form>

      {!current && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-2">
            Sugestões
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => generate(s)}
                disabled={loading}
                className="text-left text-xs border border-ink/15 rounded-sm px-3 py-2 hover:bg-terracotta/10 hover:border-terracotta/40 disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {items.length > 0 && !current && (
        <section>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-2">
            Salvos ({items.length})
          </p>
          <ul className="space-y-2">
            {items.map((i) => (
              <li
                key={i.id}
                className="flex items-center gap-3 bg-paper-soft border border-ink/15 rounded-sm px-3 py-2"
              >
                <BookOpen className="size-4 text-terracotta shrink-0" />
                <button
                  onClick={() => setActive(i.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="text-sm font-display leading-tight truncate">
                    {i.topic}
                  </p>
                  <p className="font-mono text-[10px] text-ink/55 mt-0.5">
                    {new Date(i.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </button>
                <button
                  onClick={() => remove(i.id)}
                  className="text-ink/40 hover:text-destructive"
                  aria-label="Excluir"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {current && (
        <section className="ledger-card rounded-sm p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setActive(null)}
              className="text-[11px] font-mono uppercase tracking-wider text-ink/60 hover:text-ink"
            >
              ← voltar
            </button>
            <button
              onClick={() => remove(current.id)}
              className="text-[11px] font-mono uppercase tracking-wider text-destructive inline-flex items-center gap-1"
            >
              <Trash2 className="size-3.5" /> excluir
            </button>
          </div>
          <Markdown text={current.markdown} />
        </section>
      )}
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  // Renderizador simples para o formato controlado retornado pela IA.
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let listBuf: string[] = [];
  let ordered = false;

  const flush = () => {
    if (!listBuf.length) return;
    out.push(
      ordered ? (
        <ol key={out.length} className="list-decimal pl-5 space-y-1.5 text-sm leading-relaxed">
          {listBuf.map((l, i) => (
            <li key={i}>{inline(l)}</li>
          ))}
        </ol>
      ) : (
        <ul key={out.length} className="list-disc pl-5 space-y-1 text-sm leading-relaxed">
          {listBuf.map((l, i) => (
            <li key={i}>{inline(l)}</li>
          ))}
        </ul>
      ),
    );
    listBuf = [];
  };

  lines.forEach((raw, idx) => {
    const l = raw.trim();
    if (!l) {
      flush();
      return;
    }
    if (l.startsWith("# ")) {
      flush();
      out.push(
        <h1 key={idx} className="font-display text-2xl leading-tight border-b-2 border-ink pb-2">
          {l.slice(2)}
        </h1>,
      );
    } else if (l.startsWith("## ")) {
      flush();
      out.push(
        <h2 key={idx} className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta mt-4">
          {l.slice(3)}
        </h2>,
      );
    } else if (/^\d+\.\s/.test(l)) {
      if (!ordered) flush();
      ordered = true;
      listBuf.push(l.replace(/^\d+\.\s/, ""));
    } else if (l.startsWith("- ") || l.startsWith("* ")) {
      if (ordered) flush();
      ordered = false;
      listBuf.push(l.slice(2));
    } else {
      flush();
      out.push(
        <p key={idx} className="text-sm leading-relaxed">
          {inline(l)}
        </p>,
      );
    }
  });
  flush();
  return <div className="space-y-2">{out}</div>;
}

function inline(s: string): React.ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-bold">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}