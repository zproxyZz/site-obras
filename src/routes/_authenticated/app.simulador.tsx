import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/app/simulador")({
  head: () => ({ meta: [{ title: "Simulador · ObraFácil" }] }),
  component: Simulador,
});

const PADRAO = {
  popular: { label: "Popular", brl_m2: 1800 },
  medio: { label: "Médio", brl_m2: 2800 },
  alto: { label: "Alto padrão", brl_m2: 4500 },
} as const;

function Simulador() {
  const [area, setArea] = useState("");
  const [padrao, setPadrao] = useState<keyof typeof PADRAO>("medio");
  const a = Number(area) || 0;
  const base = a * PADRAO[padrao].brl_m2;
  const brl = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Estimativa" title="Simulador de obra" meta="CUB simplificado" />
      <div className="ledger-card rounded-sm p-4 space-y-3">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
            Área construída (m²)
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
            Padrão de acabamento
          </span>
          <select
            value={padrao}
            onChange={(e) => setPadrao(e.target.value as keyof typeof PADRAO)}
            className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm font-mono uppercase"
          >
            {Object.entries(PADRAO).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label} · {brl(v.brl_m2)}/m²
              </option>
            ))}
          </select>
        </label>
      </div>
      {a > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <Block label="Material (60%)" value={brl(base * 0.6)} />
          <Block label="Mão de obra (40%)" value={brl(base * 0.4)} />
          <div className="col-span-2 border-2 border-ink bg-ink text-paper rounded-sm p-4 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/60">
              Total estimado
            </p>
            <p className="font-display text-3xl mt-1">{brl(base)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/15 bg-paper-soft rounded-sm p-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/55">{label}</p>
      <p className="font-display text-base text-terracotta mt-1">{value}</p>
    </div>
  );
}