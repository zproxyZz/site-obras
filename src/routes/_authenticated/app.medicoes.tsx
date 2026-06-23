import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/app/medicoes")({
  head: () => ({ meta: [{ title: "Medições · ObraFácil" }] }),
  component: Medicoes,
});

function Medicoes() {
  const [l, setL] = useState("");
  const [w, setW] = useState("");
  const [h, setH] = useState("");
  const ln = Number(l) || 0;
  const wn = Number(w) || 0;
  const hn = Number(h) || 0;
  const area = ln * wn;
  const perim = 2 * (ln + wn);
  const volume = area * hn;

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Cálculo" title="Medições" meta="Área · Perímetro · Volume" />
      <div className="ledger-card rounded-sm p-4 space-y-3">
        <Num label="Comprimento (m)" v={l} set={setL} />
        <Num label="Largura (m)" v={w} set={setW} />
        <Num label="Pé-direito (m, opcional)" v={h} set={setH} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Result label="Área" value={`${area.toFixed(2)} m²`} />
        <Result label="Perímetro" value={`${perim.toFixed(2)} m`} />
        <Result label="Volume" value={`${volume.toFixed(2)} m³`} />
      </div>
    </div>
  );
}

function Num({ label, v, set }: { label: string; v: string; set: (s: string) => void }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">{label}</span>
      <input
        type="number"
        step="0.01"
        value={v}
        onChange={(e) => set(e.target.value)}
        className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm font-mono"
      />
    </label>
  );
}
function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/15 bg-paper-soft rounded-sm p-3 text-center">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/55">{label}</p>
      <p className="font-display text-lg text-terracotta mt-1">{value}</p>
    </div>
  );
}