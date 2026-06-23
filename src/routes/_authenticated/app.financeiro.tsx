import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { FinanceManager } from "@/components/obrafacil/FinanceManager";

export const Route = createFileRoute("/_authenticated/app/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro · ObraFácil" }] }),
  component: () => (
    <div className="space-y-6">
      <SectionHeading eyebrow="Caixa" title="Financeiro" meta="Entradas & saídas" />
      <FinanceManager />
    </div>
  ),
});