import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { ChevronRight, FolderOpen, Plus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/app/projetos/")({
  head: () => ({
    meta: [
      { title: "Projetos · ObraFácil" },
      { name: "description", content: "Hub central de todas as suas obras." },
    ],
  }),
  component: Projetos,
});

const KINDS = ["REFORMA", "OBRA NOVA", "SIMULAÇÃO", "MANUTENÇÃO"] as const;

const schema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(80),
  kind: z.enum(KINDS),
  width_m: z.number().nonnegative().nullable(),
  length_m: z.number().nonnegative().nullable(),
  rooms: z.number().int().nonnegative().nullable(),
  budget_brl: z.number().nonnegative(),
  notes: z.string().max(500).optional(),
});

const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );

function Projetos() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMut = useMutation({
    mutationFn: async (payload: {
      name: string;
      kind: string;
      width_m: number | null;
      length_m: number | null;
      rooms: number | null;
      budget_cents: number;
      notes?: string;
    }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("projects")
        .insert({ ...payload, user_id: u.user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Projeto criado.");
      qc.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      kind: String(fd.get("kind") ?? "REFORMA") as (typeof KINDS)[number],
      width_m: numOrNull(fd.get("width_m")),
      length_m: numOrNull(fd.get("length_m")),
      rooms: intOrNull(fd.get("rooms")),
      budget_brl: Number(fd.get("budget_brl") ?? 0) || 0,
      notes: String(fd.get("notes") ?? "").trim() || undefined,
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    createMut.mutate({
      name: parsed.data.name,
      kind: parsed.data.kind,
      width_m: parsed.data.width_m,
      length_m: parsed.data.length_m,
      rooms: parsed.data.rooms,
      budget_cents: Math.round(parsed.data.budget_brl * 100),
      notes: parsed.data.notes,
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Obras"
        title="Seus projetos"
        meta={`${projects.length} cadastrados`}
      />

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full inline-flex items-center justify-center gap-2 bg-terracotta text-paper px-4 py-3 rounded-sm font-mono text-xs uppercase tracking-[0.2em] font-bold shadow-[3px_3px_0_0_var(--ink)]"
      >
        <Plus className="size-4" />
        {open ? "Fechar formulário" : "Novo projeto"}
      </button>

      {open && (
        <form
          onSubmit={onSubmit}
          className="ledger-card rounded-sm p-5 space-y-3 animate-ledger"
        >
          <Field label="Nome" name="name" placeholder="Reforma cozinha" required />
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
              Tipo
            </span>
            <select
              name="kind"
              defaultValue="REFORMA"
              className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2.5 font-mono text-xs uppercase"
            >
              {KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Largura (m)" name="width_m" type="number" step="0.01" />
            <Field label="Comprimento (m)" name="length_m" type="number" step="0.01" />
            <Field label="Cômodos" name="rooms" type="number" step="1" />
          </div>
          <Field
            label="Orçamento (R$)"
            name="budget_brl"
            type="number"
            step="0.01"
            defaultValue="0"
          />
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
              Observações
            </span>
            <textarea
              name="notes"
              rows={3}
              maxLength={500}
              className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={createMut.isPending}
            className="w-full bg-ink text-paper py-2.5 rounded-sm font-mono text-xs uppercase tracking-[0.2em] font-bold disabled:opacity-60"
          >
            {createMut.isPending ? "Salvando…" : "Salvar projeto"}
          </button>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm text-ink/60 font-mono">Carregando…</p>
      ) : projects.length === 0 ? (
        <div className="border-2 border-dashed border-ink/20 rounded-sm p-8 text-center">
          <FolderOpen className="size-6 text-ink/40 mx-auto" />
          <p className="mt-3 font-display text-lg">Nenhuma obra ainda</p>
          <p className="text-xs text-ink/60 mt-1">
            Use o botão acima para cadastrar seu primeiro projeto.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              to="/app/projetos/$id"
              params={{ id: p.id }}
              className="bg-paper-soft border border-ink/15 rounded-sm p-4 flex items-center gap-4 hover:border-ink/40 transition-colors"
            >
              <div className="size-10 grid place-items-center border border-ink/20 rounded-sm">
                <FolderOpen className="size-5 text-terracotta" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg leading-tight truncate">
                  {p.name}
                </p>
                <p className="font-mono text-[11px] text-ink/55 mt-0.5">
                  {p.kind}
                  {p.width_m && p.length_m
                    ? ` · ${p.width_m}×${p.length_m} m`
                    : ""}
                  {p.rooms ? ` · ${p.rooms} cômodos` : ""}
                </p>
              </div>
              <span className="font-mono text-sm text-terracotta font-bold whitespace-nowrap">
                {brl(p.budget_cents ?? 0)}
              </span>
              <ChevronRight className="size-4 text-ink/40 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  step,
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
        {label}
      </span>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
      />
    </label>
  );
}

function numOrNull(v: FormDataEntryValue | null) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function intOrNull(v: FormDataEntryValue | null) {
  const n = numOrNull(v);
  return n == null ? null : Math.trunc(n);
}