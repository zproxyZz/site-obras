import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/tintas")({
  head: () => ({ meta: [{ title: "Cores & Tintas · ObraFácil" }] }),
  component: Tintas,
});

type Acab = "fosco" | "acetinado" | "semi-brilho" | "brilho";
type Tinta = {
  id: string;
  nome: string;
  marca: string;
  codigo: string;
  acabamento: Acab;
  precoGalao: number; // R$ por galão 3,6L
  hex: string;
};

const CATALOGO: Tinta[] = [
  { id: "s001", nome: "Branco Neve", marca: "Suvinil", codigo: "S-001", acabamento: "fosco", precoGalao: 109.9, hex: "#F5F2EC" },
  { id: "s014", nome: "Branco Gelo", marca: "Suvinil", codigo: "S-014", acabamento: "acetinado", precoGalao: 129.9, hex: "#E8E5DA" },
  { id: "s118", nome: "Areia", marca: "Suvinil", codigo: "S-118", acabamento: "fosco", precoGalao: 134.9, hex: "#D8C9A8" },
  { id: "s322", nome: "Terracota", marca: "Suvinil", codigo: "S-322", acabamento: "acetinado", precoGalao: 154.9, hex: "#C75D3B" },
  { id: "s540", nome: "Azul Petróleo", marca: "Suvinil", codigo: "S-540", acabamento: "semi-brilho", precoGalao: 169.9, hex: "#2D5566" },
  { id: "s617", nome: "Verde Musgo", marca: "Suvinil", codigo: "S-617", acabamento: "acetinado", precoGalao: 149.9, hex: "#6B7F3F" },
  { id: "s410", nome: "Amarelo Ocre", marca: "Suvinil", codigo: "S-410", acabamento: "fosco", precoGalao: 139.9, hex: "#E3B73E" },
  { id: "s900", nome: "Grafite", marca: "Suvinil", codigo: "S-900", acabamento: "acetinado", precoGalao: 164.9, hex: "#2B2B2B" },
  { id: "c220", nome: "Rosa Antigo", marca: "Coral", codigo: "C-220", acabamento: "fosco", precoGalao: 144.9, hex: "#C9A0A0" },
  { id: "c455", nome: "Cinza Concreto", marca: "Coral", codigo: "C-455", acabamento: "acetinado", precoGalao: 139.9, hex: "#8E8B86" },
] as const;

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

function hexToRgb(h: string) {
  const m = h.replace("#", "");
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)] as const;
}
function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}
function mixColors(parts: { hex: string; pct: number }[]) {
  const total = parts.reduce((s, p) => s + p.pct, 0) || 1;
  let r = 0, g = 0, b = 0;
  for (const p of parts) {
    const [pr, pg, pb] = hexToRgb(p.hex);
    r += (pr * p.pct) / total;
    g += (pg * p.pct) / total;
    b += (pb * p.pct) / total;
  }
  return rgbToHex(r, g, b);
}
function nearestName(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  let best = CATALOGO[0];
  let dist = Infinity;
  for (const t of CATALOGO) {
    const [tr, tg, tb] = hexToRgb(t.hex);
    const d = (tr - r) ** 2 + (tg - g) ** 2 + (tb - b) ** 2;
    if (d < dist) { dist = d; best = t; }
  }
  return best.nome;
}
function readable(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? "#2C2A28" : "#F4F1EA";
}

type Mix = { id: string; pct: number };

function Tintas() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Acab>("all");
  const [mix, setMix] = useState<Mix[]>([]);
  const [area, setArea] = useState("30");
  const [demaos, setDemaos] = useState("2");
  const [rend] = useState(12);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return CATALOGO.filter(
      (t) =>
        (filter === "all" || t.acabamento === filter) &&
        (!term ||
          t.nome.toLowerCase().includes(term) ||
          t.codigo.toLowerCase().includes(term) ||
          t.marca.toLowerCase().includes(term)),
    );
  }, [q, filter]);

  function addToMix(t: Tinta) {
    setMix((m) => {
      if (m.find((x) => x.id === t.id)) return m;
      const restante = Math.max(0, 100 - m.reduce((s, p) => s + p.pct, 0));
      const pct = m.length === 0 ? 100 : restante > 0 ? restante : 10;
      // Se vamos passar de 100, normaliza
      const next = [...m, { id: t.id, pct }];
      return normalize(next);
    });
  }
  function removeFromMix(id: string) {
    setMix((m) => normalize(m.filter((p) => p.id !== id)));
  }
  function setPct(id: string, pct: number) {
    setMix((m) => {
      const others = m.filter((p) => p.id !== id);
      const restante = Math.max(0, 100 - pct);
      const sumOthers = others.reduce((s, p) => s + p.pct, 0) || 1;
      const adjusted = others.map((p) => ({
        ...p,
        pct: others.length ? (p.pct / sumOthers) * restante : 0,
      }));
      return [...adjusted, { id, pct }].sort(
        (a, b) => m.findIndex((x) => x.id === a.id) - m.findIndex((x) => x.id === b.id),
      );
    });
  }
  function normalize(m: Mix[]): Mix[] {
    const sum = m.reduce((s, p) => s + p.pct, 0);
    if (sum === 0 && m.length) return m.map((p) => ({ ...p, pct: 100 / m.length }));
    if (sum === 0) return m;
    return m.map((p) => ({ ...p, pct: (p.pct / sum) * 100 }));
  }

  const mixDetail = mix
    .map((m) => {
      const t = CATALOGO.find((c) => c.id === m.id)!;
      return { ...t, pct: m.pct };
    })
    .filter(Boolean);

  const resultHex = mixDetail.length
    ? mixColors(mixDetail.map((p) => ({ hex: p.hex, pct: p.pct })))
    : "#E8E5DA";
  const resultName = mixDetail.length === 1 ? mixDetail[0].nome : nearestName(resultHex);

  // Cálculo
  const a = Number(area) || 0;
  const d = Number(demaos) || 1;
  const litros = a > 0 ? (a * d) / rend : 0;
  const galoes = Math.ceil(litros / 3.6);
  const precoMedioGalao = mixDetail.length
    ? mixDetail.reduce((s, p) => s + (p.precoGalao * p.pct) / 100, 0)
    : CATALOGO[0].precoGalao;
  const precoMedioL = precoMedioGalao / 3.6;
  const custoTotal = galoes * precoMedioGalao;

  const filtros: { k: "all" | Acab; label: string }[] = [
    { k: "all", label: "Todas" },
    { k: "fosco", label: "Fosco" },
    { k: "acetinado", label: "Acetinado" },
    { k: "semi-brilho", label: "Semi-brilho" },
    { k: "brilho", label: "Brilho" },
  ];

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Tintamix" title="Tintas & Mistura" meta={`${CATALOGO.length} cores`} />

      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar tinta…"
            className="w-full bg-paper border-2 border-ink rounded-sm pl-9 pr-3 py-2.5 text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | Acab)}
          className="bg-paper border-2 border-ink rounded-sm px-3 py-2.5 font-mono text-xs uppercase"
        >
          {filtros.map((f) => (
            <option key={f.k} value={f.k}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Catálogo */}
      <div className="grid grid-cols-2 gap-3">
        {list.map((t) => (
          <article
            key={t.id}
            className="border-2 border-ink rounded-sm overflow-hidden bg-paper"
          >
            <div className="h-28 relative" style={{ backgroundColor: t.hex }}>
              <button
                onClick={() => addToMix(t)}
                aria-label={`Adicionar ${t.nome} à mistura`}
                className="absolute top-1.5 right-1.5 size-7 grid place-items-center bg-paper border border-ink rounded-sm shadow hover:bg-terracotta hover:text-paper"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <div className="p-2.5">
              <p className="font-display text-sm leading-tight">{t.nome}</p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-ink/55 mt-0.5">
                {t.marca} · {t.codigo}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="font-mono text-[10px] text-ink/60 lowercase">
                  {t.acabamento}
                </span>
                <span className="font-mono text-xs font-bold text-terracotta">
                  {brl(t.precoGalao)}
                </span>
              </div>
            </div>
          </article>
        ))}
        {list.length === 0 && (
          <p className="col-span-2 text-center py-6 font-mono text-xs text-ink/55">
            Nenhuma tinta encontrada.
          </p>
        )}
      </div>

      {/* Mixer / Cor resultante */}
      {mix.length > 0 && (
        <section className="ledger-card rounded-sm p-4 space-y-3">
          <div
            className="rounded-sm p-4 border border-ink/15"
            style={{ backgroundColor: resultHex, color: readable(resultHex) }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">
              Cor resultante
            </p>
            <p className="font-display text-2xl leading-tight mt-1">{resultName}</p>
            <p className="font-mono text-[10px] mt-1 opacity-75">{resultHex}</p>
            <p className="font-mono text-[10px] mt-1 opacity-75">
              {mixDetail
                .map((m) => `${Math.round(m.pct)}% ${m.nome}`)
                .join(" + ")}
            </p>
          </div>

          <ul className="space-y-2.5">
            {mixDetail.map((p) => (
              <li key={p.id} className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="size-4 border border-ink rounded-sm shrink-0"
                    style={{ backgroundColor: p.hex }}
                  />
                  <span className="flex-1 font-display">{p.nome}</span>
                  <span className="font-mono text-[10px] text-ink/55">{p.marca}</span>
                  <span className="font-mono text-xs font-bold w-10 text-right">
                    {Math.round(p.pct)}%
                  </span>
                  <button
                    onClick={() => removeFromMix(p.id)}
                    className="text-ink/40 hover:text-destructive"
                    aria-label="Remover"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(p.pct)}
                  onChange={(e) => setPct(p.id, Number(e.target.value))}
                  className="w-full accent-terracotta"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Cálculo de área */}
      <section className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
              Área (m²)
            </span>
            <input
              type="number"
              step="0.01"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm font-mono"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
              Demãos
            </span>
            <input
              type="number"
              value={demaos}
              onChange={(e) => setDemaos(e.target.value)}
              className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm font-mono"
            />
          </label>
        </div>
        <div className="ledger-card rounded-sm p-4 space-y-2">
          <Row label="Tinta" value={`${litros.toFixed(1)} L`} />
          <Row label="Galões 3,6L" value={`${galoes} un.`} />
          <Row label="Preço médio" value={`${brl(precoMedioL)} / L`} />
          <div className="flex items-baseline justify-between gap-3 pt-2 border-t-2 border-ink">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Custo total
            </span>
            <span className="font-display text-2xl text-terracotta">
              {brl(custoTotal)}
            </span>
          </div>
        </div>
        <p className="font-mono text-[10px] text-ink/50 leading-relaxed">
          Rendimento padrão de 12 m²/L. Preço médio calculado pela proporção
          das tintas selecionadas no mixer.
        </p>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink/15 pb-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
        {label}
      </span>
      <span className="font-display text-sm">{value}</span>
    </div>
  );
}