import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const brl = (c: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c / 100);

export function FinanceManager({ projectId }: { projectId?: string }) {
  const qc = useQueryClient();
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<"in" | "out">("out");

  const queryKey = ["transactions", projectId ?? "all"];
  const { data: txs = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase
        .from("transactions")
        .select("*")
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false });
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const totals = txs.reduce(
    (acc, t) => {
      if (t.kind === "in") acc.in += t.amount_cents;
      else acc.out += t.amount_cents;
      return acc;
    },
    { in: 0, out: 0 },
  );

  const add = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const cents = Math.round((Number(amount) || 0) * 100);
      if (!desc.trim() || cents <= 0) throw new Error("Informe descrição e valor");
      const { error } = await supabase.from("transactions").insert({
        user_id: u.user.id,
        project_id: projectId ?? null,
        description: desc.trim(),
        amount_cents: cents,
        kind,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDesc("");
      setAmount("");
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Entradas" value={brl(totals.in)} tone="ok" />
        <Stat label="Saídas" value={brl(totals.out)} tone="bad" />
        <Stat label="Saldo" value={brl(totals.in - totals.out)} tone="neutral" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
        className="ledger-card rounded-sm p-3 space-y-2"
      >
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Descrição (ex: 5 sacos de cimento)"
          className="w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="0.01"
            placeholder="R$"
            className="w-28 bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm font-mono"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as "in" | "out")}
            className="flex-1 bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm font-mono uppercase"
          >
            <option value="out">Saída</option>
            <option value="in">Entrada</option>
          </select>
          <button
            type="submit"
            disabled={add.isPending}
            className="inline-flex items-center gap-1 bg-terracotta text-paper px-3 py-2 rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] font-bold disabled:opacity-50"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </form>

      {txs.length === 0 ? (
        <p className="text-xs text-ink/55 font-mono text-center py-6">
          Sem lançamentos ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {txs.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 bg-paper-soft border border-ink/15 rounded-sm px-3 py-2"
            >
              <div
                className={`size-8 grid place-items-center rounded-sm shrink-0 ${
                  t.kind === "in" ? "bg-emerald-100 text-emerald-700" : "bg-terracotta/15 text-terracotta"
                }`}
              >
                {t.kind === "in" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-tight truncate">{t.description}</p>
                <p className="font-mono text-[10px] text-ink/55 mt-0.5">
                  {new Date(t.occurred_on).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <span
                className={`font-mono text-sm font-bold ${
                  t.kind === "in" ? "text-emerald-700" : "text-terracotta"
                }`}
              >
                {t.kind === "in" ? "+" : "−"}
                {brl(t.amount_cents)}
              </span>
              <button
                onClick={() => remove.mutate(t.id)}
                className="text-ink/40 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "ok" | "bad" | "neutral" }) {
  const color =
    tone === "ok" ? "text-emerald-700" : tone === "bad" ? "text-terracotta" : "text-ink";
  return (
    <div className="border border-ink/15 bg-paper rounded-sm p-2.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/55">
        {label}
      </p>
      <p className={`font-display text-base mt-0.5 leading-tight ${color}`}>{value}</p>
    </div>
  );
}