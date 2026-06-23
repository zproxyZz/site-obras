import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FolderOpen,
  CheckSquare,
  Camera,
  Ruler,
  HardHat,
  Palette,
  Sofa,
  Package,
  BookOpen,
  Sparkles,
  Receipt,
  CalendarRange,
  Lightbulb,
  Plus,
} from "lucide-react";
import { SectionHeading, RuleHeading } from "@/components/obrafacil/AppShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "Painel · ObraFácil" },
      {
        name: "description",
        content:
          "Acesso rápido a todas as ferramentas e seus projetos de obra.",
      },
    ],
  }),
  component: Painel,
});

const tools = [
  { to: "/app/projetos", icon: FolderOpen, title: "Projetos", desc: "Hub central de cada obra" },
  { to: "/app/checklist", icon: CheckSquare, title: "Checklist", desc: "Tarefas de todos os projetos" },
  { to: "/app/camera", icon: Camera, title: "Câmera", desc: "Medição por foto (2 pontos)" },
  { to: "/app/medicoes", icon: Ruler, title: "Medições", desc: "Áreas, volumes e proporções" },
  { to: "/app/simulador", icon: HardHat, title: "Simulador", desc: "Estime sua obra completa" },
  { to: "/app/tintas", icon: Palette, title: "Cores & Tintas", desc: "Catálogo e calculadora" },
  { to: "/app/decoracao", icon: Sofa, title: "Decoração", desc: "Móveis 2D e sugestões" },
  { to: "/app/materiais", icon: Package, title: "Materiais", desc: "Quantidades inteligentes" },
  { to: "/app/tutoriais", icon: BookOpen, title: "Tutoriais", desc: "Gerados e curados por IA" },
  { to: "/app/ia", icon: Sparkles, title: "IA da Obra", desc: "Pergunte qualquer coisa" },
  { to: "/app/financeiro", icon: Receipt, title: "Financeiro", desc: "Orçamento por projeto" },
  { to: "/app/agenda", icon: CalendarRange, title: "Cronograma", desc: "Progresso por projeto" },
] as const;

const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );

function Painel() {
  const [firstName, setFirstName] = useState<string>("mestre");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      const name =
        (u?.user_metadata?.full_name as string | undefined) ||
        (u?.user_metadata?.name as string | undefined) ||
        u?.email?.split("@")[0] ||
        "mestre";
      setFirstName(name.split(" ")[0]);
    });
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,name,kind,width_m,length_m,rooms,budget_cents")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <section className="animate-ledger">
        <SectionHeading
          eyebrow="Painel"
          title={`Olá, ${firstName} — bora levantar essa obra?`}
        />
        <p className="text-sm text-ink/70 leading-relaxed">
          Acesso rápido a todas as ferramentas e seus projetos cadastrados.
        </p>
      </section>

      {/* Dica do dia */}
      <section className="animate-ledger [animation-delay:80ms]">
        <div className="flex items-start gap-3 border border-terracotta/30 bg-terracotta/5 rounded-sm p-4">
          <div className="size-10 shrink-0 grid place-items-center bg-terracotta/15 rounded-sm">
            <Lightbulb className="size-5 text-terracotta" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta">
              Dica do dia #14
            </p>
            <p className="text-sm mt-1 leading-relaxed">
              Tinta com mais de 6 meses aberta perde rendimento. Cheire antes
              de usar — odor azedo é descarte.
            </p>
          </div>
        </div>
      </section>

      {/* Budget selector */}
      <section className="animate-ledger [animation-delay:160ms]">
        <div className="ledger-card rounded-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
              Orçamento do projeto
            </span>
            <Link
              to="/app/projetos"
              className="bg-terracotta/15 text-terracotta font-mono text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wide hover:bg-terracotta/25"
            >
              Gerenciar
            </Link>
          </div>
          {projects.length === 0 ? (
            <>
              <h3 className="font-display text-xl text-terracotta">
                Nenhum projeto ainda
              </h3>
              <p className="text-xs text-ink/60 mt-1">
                Crie sua primeira obra para começar a acompanhar orçamento e materiais.
              </p>
              <Link
                to="/app/projetos"
                className="mt-4 inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] font-bold"
              >
                <Plus className="size-4" /> Criar projeto
              </Link>
            </>
          ) : (
            <>
              <h3 className="font-display text-xl text-terracotta">
                {projects[0].name}
              </h3>
              <p className="text-xs text-ink/60 mt-1">
                Último projeto cadastrado · orçamento {brl(projects[0].budget_cents ?? 0)}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Tools */}
      <section className="animate-ledger [animation-delay:240ms]">
        <RuleHeading>Ferramentas de canteiro</RuleHeading>
        <div className="grid grid-cols-2 gap-px bg-ink/15 border border-ink/15 rounded-sm overflow-hidden">
          {tools.map(({ to, icon: Icon, title, desc }, i) => (
            <Link
              key={title}
              to={to as string}
              className="bg-paper p-4 flex flex-col gap-3 hover:bg-terracotta/5 active:bg-terracotta/10 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="size-9 grid place-items-center border border-ink/20 rounded-sm bg-paper-soft group-hover:bg-ink group-hover:text-paper transition-colors">
                  <Icon className="size-4" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[10px] text-ink/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <p className="font-display text-base leading-tight">{title}</p>
                <p className="text-[11px] text-ink/60 mt-0.5 leading-snug">
                  {desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* User projects */}
      <section className="animate-ledger [animation-delay:320ms]">
        <RuleHeading>Seus projetos</RuleHeading>
        {projects.length === 0 ? (
          <div className="border-2 border-dashed border-ink/20 rounded-sm p-8 text-center">
            <FolderOpen className="size-6 text-ink/40 mx-auto" />
            <p className="mt-3 font-display text-lg">Sem obras cadastradas</p>
            <p className="text-xs text-ink/60 mt-1">
              Tudo aqui é seu — adicione projetos para popular o caderno.
            </p>
            <Link
              to="/app/projetos"
              className="mt-4 inline-flex items-center gap-2 bg-terracotta text-paper px-4 py-2 rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] font-bold"
            >
              <Plus className="size-4" /> Novo projeto
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                to="/app/projetos/$id"
                params={{ id: p.id }}
                className="bg-paper-soft border border-ink/15 rounded-sm p-4 hover:border-ink/40 transition-colors block"
              >
                <div className="flex items-center justify-between mb-3">
                  <FolderOpen className="size-4 text-terracotta" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
                    {p.kind}
                  </span>
                </div>
                <p className="font-display text-lg leading-tight">{p.name}</p>
                <p className="text-[11px] font-mono text-ink/60 mt-0.5">
                  {p.width_m && p.length_m
                    ? `${p.width_m}×${p.length_m} m`
                    : "—"}{" "}
                  {p.rooms ? `· ${p.rooms} cômodos` : ""}
                </p>
                <div className="mt-4 pt-3 border-t border-dashed border-ink/15">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50 block">
                    Orçamento
                  </span>
                  <span className="font-display text-xl text-terracotta">
                    {brl(p.budget_cents ?? 0)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}