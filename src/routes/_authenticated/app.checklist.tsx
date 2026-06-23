import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { TasksManager } from "@/components/obrafacil/TasksManager";

export const Route = createFileRoute("/_authenticated/app/checklist")({
  head: () => ({ meta: [{ title: "Checklist · ObraFácil" }] }),
  component: () => (
    <div className="space-y-6">
      <SectionHeading eyebrow="Tarefas" title="Checklist geral" meta="Tudo em um lugar" />
      <TasksManager
        kind="checklist"
        emptyHint="Sem tarefas. Adicione o que precisa ser feito no canteiro."
      />
    </div>
  ),
});