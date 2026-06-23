import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/app/materiais")({
  head: () => ({ meta: [{ title: "Materiais · ObraFácil" }] }),
  component: Materiais,
});

function Materiais() {
  const [area, setArea] = useState("");
  const a = Number(area) || 0;
  // Estimativas de canteiro (regra de bolso)
  const piso = Math.ceil(a * 1.1); // m² c/ 10% perda
  const tijolos = Math.ceil(a * 25); // 25/m² (parede 1 vez)
  const cimentoCp = Math.ceil(a * 0.18); // contrapiso 3cm
  const argamassa = Math.ceil(a * 4); // kg/m² assentamento
  const tinta = (a / 12).toFixed(2); // 1L = ~12m²/demão

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Quantidades" title="Materiais" meta="Estimativa por m²" />
      <div className="ledger-card rounded-sm p-4">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
            Área (m²)
          </span>
          <input
            type="number"
            step="0.01"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="ex: 30"
            className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm font-mono"
          />
        </label>
      </div>
      {a > 0 && (
        <ul className="space-y-2">
          <Item label="Piso/azulejo (c/ 10% perda)" value={`${piso} m²`} />
          <Item label="Tijolos (parede 1 vez)" value={`${tijolos} un`} />
          <Item label="Cimento contrapiso 3cm" value={`${cimentoCp} sacos 50kg`} />
          <Item label="Argamassa assentamento" value={`${argamassa} kg`} />
          <Item label="Tinta por demão" value={`${tinta} L`} />
        </ul>
      )}
      <p className="font-mono text-[10px] text-ink/50 leading-relaxed">
        Valores de referência. Confira com o fornecedor e ajuste conforme projeto.
      </p>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between bg-paper-soft border border-ink/15 rounded-sm px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <span className="font-mono text-sm font-bold text-terracotta">{value}</span>
    </li>
  );
}