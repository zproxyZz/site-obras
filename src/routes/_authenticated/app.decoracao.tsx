import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/decoracao")({
  head: () => ({ meta: [{ title: "Decoração · ObraFácil" }] }),
  component: Decoracao,
});

type Furn = { id: string; nome: string; x: number; y: number; w: number; h: number; cor: string };

const CATALOGO = [
  { nome: "Sofá", w: 220, h: 90, cor: "#C75D3B" },
  { nome: "Mesa", w: 160, h: 90, cor: "#5B6A4A" },
  { nome: "Cama", w: 200, h: 160, cor: "#274F58" },
  { nome: "Estante", w: 180, h: 40, cor: "#2C2A28" },
];

function Decoracao() {
  const [larg, setLarg] = useState("400");
  const [comp, setComp] = useState("500");
  const [items, setItems] = useState<Furn[]>([]);

  const L = Number(larg) || 400;
  const C = Number(comp) || 500;

  function add(c: (typeof CATALOGO)[number]) {
    setItems((it) => [
      ...it,
      { id: crypto.randomUUID(), nome: c.nome, x: 20, y: 20, w: c.w, h: c.h, cor: c.cor },
    ]);
  }
  function move(id: string, dx: number, dy: number) {
    setItems((it) =>
      it.map((f) =>
        f.id === id
          ? { ...f, x: Math.max(0, Math.min(L - f.w, f.x + dx)), y: Math.max(0, Math.min(C - f.h, f.y + dy)) }
          : f,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Layout 2D" title="Decoração" meta="Planta simples" />

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
            Largura (cm)
          </span>
          <input
            type="number"
            value={larg}
            onChange={(e) => setLarg(e.target.value)}
            className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm font-mono"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
            Comprimento (cm)
          </span>
          <input
            type="number"
            value={comp}
            onChange={(e) => setComp(e.target.value)}
            className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm font-mono"
          />
        </label>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATALOGO.map((c) => (
          <button
            key={c.nome}
            onClick={() => add(c)}
            className="inline-flex items-center gap-1 border-2 border-ink rounded-sm px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider hover:bg-ink hover:text-paper"
          >
            <Plus className="size-3" /> {c.nome}
          </button>
        ))}
      </div>

      <div
        className="relative border-2 border-ink rounded-sm bg-paper-soft mx-auto"
        style={{ width: "100%", aspectRatio: `${L} / ${C}` }}
      >
        {items.map((f) => (
          <button
            key={f.id}
            onDoubleClick={() => setItems((it) => it.filter((x) => x.id !== f.id))}
            onClick={() => move(f.id, 20, 0)}
            className="absolute text-paper text-[9px] font-mono uppercase flex items-center justify-center border border-ink/40"
            style={{
              left: `${(f.x / L) * 100}%`,
              top: `${(f.y / C) * 100}%`,
              width: `${(f.w / L) * 100}%`,
              height: `${(f.h / C) * 100}%`,
              backgroundColor: f.cor,
            }}
            title="Clique p/ mover · 2 cliques p/ remover"
          >
            {f.nome}
          </button>
        ))}
      </div>
      <p className="font-mono text-[10px] text-ink/55 leading-relaxed">
        Toque em um móvel para movê-lo 20cm. Toque duplo remove.
      </p>
      {items.length > 0 && (
        <button
          onClick={() => setItems([])}
          className="inline-flex items-center gap-1 text-xs font-mono uppercase text-ink/55 hover:text-destructive"
        >
          <Trash2 className="size-3.5" /> limpar tudo
        </button>
      )}
    </div>
  );
}