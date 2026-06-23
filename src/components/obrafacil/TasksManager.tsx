import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Kind = "agenda" | "checklist";

export function TasksManager({
  kind,
  projectId,
  emptyHint,
}: {
  kind: Kind;
  projectId?: string;
  emptyHint: string;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");

  const queryKey = ["tasks", kind, projectId ?? "all"];

  const { data: tasks = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase
        .from("tasks")
        .select("*")
        .eq("kind", kind)
        .order("done", { ascending: true })
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const { error } = await supabase.from("tasks").insert({
        user_id: u.user.id,
        project_id: projectId ?? null,
        title: title.trim(),
        kind,
        due_date: due || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setDue("");
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (t: { id: string; done: boolean }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ done: !t.done })
        .eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          add.mutate();
        }}
        className="ledger-card rounded-sm p-3 space-y-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            kind === "agenda" ? "Nova etapa / marco" : "Nova tarefa"
          }
          className="w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          {kind === "agenda" && (
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="flex-1 bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm font-mono"
            />
          )}
          <button
            type="submit"
            disabled={add.isPending}
            className="ml-auto inline-flex items-center gap-1 bg-terracotta text-paper px-4 py-2 rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] font-bold disabled:opacity-50"
          >
            <Plus className="size-3.5" /> Adicionar
          </button>
        </div>
      </form>

      {tasks.length === 0 ? (
        <p className="text-xs text-ink/55 font-mono text-center py-6">
          {emptyHint}
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 bg-paper-soft border border-ink/15 rounded-sm px-3 py-2"
            >
              <button
                onClick={() => toggle.mutate({ id: t.id, done: t.done })}
                className={`size-5 grid place-items-center border-2 border-ink rounded-sm shrink-0 ${
                  t.done ? "bg-terracotta text-paper" : "bg-paper"
                }`}
                aria-label="Concluir"
              >
                {t.done && <Check className="size-3" strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-tight ${
                    t.done ? "line-through text-ink/40" : ""
                  }`}
                >
                  {t.title}
                </p>
                {t.due_date && (
                  <p className="font-mono text-[10px] text-ink/55 mt-0.5">
                    {new Date(t.due_date).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
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