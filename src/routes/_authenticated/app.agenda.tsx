import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { TasksManager } from "@/components/obrafacil/TasksManager";

export const Route = createFileRoute("/_authenticated/app/agenda")({
  head: () => ({ meta: [{ title: "Agenda · ObraFácil" }] }),
  component: () => (
    <div className="space-y-6">
      <SectionHeading eyebrow="Cronograma" title="Agenda da obra" meta="Etapas & marcos" />
      <TasksManager
        kind="agenda"
        emptyHint="Nenhum marco. Adicione etapas com datas para acompanhar o progresso."
      />
    </div>
  ),
});