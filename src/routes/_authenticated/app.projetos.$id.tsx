import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { TasksManager } from "@/components/obrafacil/TasksManager";
import { FinanceManager } from "@/components/obrafacil/FinanceManager";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { ArrowLeft, Pencil, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const KINDS = ["REFORMA", "OBRA NOVA", "SIMULAÇÃO", "MANUTENÇÃO"] as const;

const brl = (c: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c / 100);

export const Route = createFileRoute("/_authenticated/app/projetos/$id")({
  head: () => ({ meta: [{ title: "Projeto · ObraFácil" }] }),
  component: ProjetoDetalhe,
});

function ProjetoDetalhe() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"info" | "agenda" | "checklist" | "financeiro">("info");
  const [editing, setEditing] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    name: "",
    kind: "REFORMA" as (typeof KINDS)[number],
    width_m: "",
    length_m: "",
    rooms: "",
    budget_brl: "",
    notes: "",
  });

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        kind: project.kind as (typeof KINDS)[number],
        width_m: project.width_m?.toString() ?? "",
        length_m: project.length_m?.toString() ?? "",
        rooms: project.rooms?.toString() ?? "",
        budget_brl: ((project.budget_cents ?? 0) / 100).toString(),
        notes: project.notes ?? "",
      });
    }
  }, [project]);

  const update = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .update({
          name: form.name.trim(),
          kind: form.kind,
          width_m: form.width_m ? Number(form.width_m) : null,
          length_m: form.length_m ? Number(form.length_m) : null,
          rooms: form.rooms ? Math.trunc(Number(form.rooms)) : null,
          budget_cents: Math.round((Number(form.budget_brl) || 0) * 100),
          notes: form.notes.trim() || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Projeto atualizado.");
      qc.invalidateQueries({ queryKey: ["projects"] });
      setEditing(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Projeto excluído.");
      qc.invalidateQueries({ queryKey: ["projects"] });
      navigate({ to: "/app/projetos" });
    },
  });

  if (isLoading) {
    return <p className="font-mono text-xs text-ink/55">Carregando…</p>;
  }
  if (!project) {
    return (
      <div className="text-center py-10">
        <p className="font-display text-lg">Projeto não encontrado</p>
        <Link
          to="/app/projetos"
          className="mt-3 inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-terracotta"
        >
          <ArrowLeft className="size-3.5" /> voltar
        </Link>
      </div>
    );
  }

  const tabs = [
    { k: "info", label: "Resumo" },
    { k: "agenda", label: "Agenda" },
    { k: "checklist", label: "Tarefas" },
    { k: "financeiro", label: "Caixa" },
  ] as const;

  return (
    <div className="space-y-5">
      <Link
        to="/app/projetos"
        className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-ink/60 hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Projetos
      </Link>

      <SectionHeading eyebrow={project.kind} title={project.name} meta={brl(project.budget_cents ?? 0)} />

      <nav className="flex gap-1 border-b-2 border-ink overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] whitespace-nowrap border-b-2 -mb-0.5 ${
              tab === t.k
                ? "border-terracotta text-terracotta font-bold"
                : "border-transparent text-ink/55"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "info" && (
        <div className="space-y-4">
          {!editing ? (
            <div className="ledger-card rounded-sm p-5 space-y-3">
              <Row label="Tipo" value={project.kind} />
              <Row
                label="Dimensões"
                value={
                  project.width_m && project.length_m
                    ? `${project.width_m} × ${project.length_m} m  (${(Number(project.width_m) * Number(project.length_m)).toFixed(2)} m²)`
                    : "—"
                }
              />
              <Row label="Cômodos" value={project.rooms?.toString() ?? "—"} />
              <Row label="Orçamento" value={brl(project.budget_cents ?? 0)} />
              <Row
                label="Criado em"
                value={new Date(project.created_at).toLocaleDateString("pt-BR")}
              />
              {project.notes && (
                <div className="pt-3 border-t border-dashed border-ink/15">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">
                    Observações
                  </p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{project.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1 bg-ink text-paper py-2.5 rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] font-bold"
                >
                  <Pencil className="size-3.5" /> Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir "${project.name}"?`)) remove.mutate();
                  }}
                  className="inline-flex items-center justify-center gap-1 border-2 border-destructive text-destructive px-4 rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] font-bold"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                update.mutate();
              }}
              className="ledger-card rounded-sm p-5 space-y-3"
            >
              <Field
                label="Nome"
                v={form.name}
                set={(v) => setForm((f) => ({ ...f, name: v }))}
                required
              />
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
                  Tipo
                </span>
                <select
                  value={form.kind}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, kind: e.target.value as (typeof KINDS)[number] }))
                  }
                  className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2.5 font-mono text-xs uppercase"
                >
                  {KINDS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Field
                  label="Larg. (m)"
                  v={form.width_m}
                  set={(v) => setForm((f) => ({ ...f, width_m: v }))}
                  type="number"
                />
                <Field
                  label="Comp. (m)"
                  v={form.length_m}
                  set={(v) => setForm((f) => ({ ...f, length_m: v }))}
                  type="number"
                />
                <Field
                  label="Cômodos"
                  v={form.rooms}
                  set={(v) => setForm((f) => ({ ...f, rooms: v }))}
                  type="number"
                />
              </div>
              <Field
                label="Orçamento (R$)"
                v={form.budget_brl}
                set={(v) => setForm((f) => ({ ...f, budget_brl: v }))}
                type="number"
              />
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
                  Observações
                </span>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={update.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-1 bg-terracotta text-paper py-2.5 rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] font-bold disabled:opacity-50"
                >
                  <Save className="size-3.5" /> Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center justify-center gap-1 border-2 border-ink px-4 rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] font-bold"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === "agenda" && (
        <TasksManager
          kind="agenda"
          projectId={id}
          emptyHint="Sem etapas. Adicione marcos com data para este projeto."
        />
      )}
      {tab === "checklist" && (
        <TasksManager
          kind="checklist"
          projectId={id}
          emptyHint="Sem tarefas neste projeto ainda."
        />
      )}
      {tab === "financeiro" && <FinanceManager projectId={id} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink/15 pb-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
        {label}
      </span>
      <span className="font-display text-sm text-right">{value}</span>
    </div>
  );
}

function Field({
  label,
  v,
  set,
  type = "text",
  required,
}: {
  label: string;
  v: string;
  set: (s: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
        {label}
      </span>
      <input
        value={v}
        onChange={(e) => set(e.target.value)}
        type={type}
        step="0.01"
        required={required}
        className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
      />
    </label>
  );
}