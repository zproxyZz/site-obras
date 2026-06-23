import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  Ruler,
  HardHat,
  Palette,
  Package,
  Sparkles,
  CalendarRange,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ObraFácil — Mestre de obras de bolso com IA" },
      {
        name: "description",
        content:
          "Calculadora de materiais, simulador de projetos, catálogo de tintas e cronograma — tudo num só lugar, com IA.",
      },
      { property: "og:title", content: "ObraFácil — Mestre de obras de bolso com IA" },
      {
        property: "og:description",
        content:
          "Ferramentas técnicas para canteiro de obra: orçamento, materiais, tintas e cronograma com IA.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Ruler,
    title: "Medições e proporções",
    text: "Áreas, volumes, regra de três e conversões com fórmula passo a passo.",
  },
  {
    icon: HardHat,
    title: "Simulador de projetos",
    text: "Dimensões, custos sugeridos, materiais e cronograma estimado.",
  },
  {
    icon: Palette,
    title: "Cores & Tintas",
    text: "Catálogo vintage, mistura de cores e calculadora de litragem por demão.",
  },
  {
    icon: Package,
    title: "Materiais inteligentes",
    text: "Cimento, areia, brita, blocos, pisos e rejunte calculados por m².",
  },
  {
    icon: Sparkles,
    title: "IA da Construção",
    text: "Chat especializado em obras, normas técnicas e execução de serviços.",
  },
  {
    icon: CalendarRange,
    title: "Cronograma & Financeiro",
    text: "Etapas, datas, orçamento previsto vs realizado, gráficos claros.",
  },
];

function Landing() {
  const [target, setTarget] = useState<"/auth" | "/app">("/auth");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setTarget(data.session ? "/app" : "/auth");
    });
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 paper-grain opacity-70" />

      {/* Header */}
      <header className="relative z-10 bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-5 py-4 flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-paper/60">
              Série v.03 · 2026
            </span>
            <span className="font-display italic text-xl mt-0.5">ObraFácil</span>
          </div>
          <Link
            to={target}
            className="font-mono text-[11px] uppercase tracking-[0.18em] bg-paper text-ink px-4 py-2 rounded-sm hover:bg-terracotta hover:text-paper transition-colors"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-10 bg-terracotta" />
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-terracotta">
            Construção sem mistério
          </span>
        </div>
        <h1 className="font-display text-[2.5rem] leading-[1.05] md:text-6xl md:leading-[1.02] tracking-tight text-balance max-w-[18ch]">
          Seu mestre de obras de bolso, com{" "}
          <em className="text-terracotta not-italic font-display italic">
            jeito antigo
          </em>{" "}
          e cabeça de IA.
        </h1>
        <p className="mt-6 text-base md:text-lg text-ink/75 max-w-[58ch] leading-relaxed text-pretty">
          Cálculos, simulações, escolha de cores, materiais, cronograma e um
          chat especializado em obras — tudo num só lugar, sem precisar
          contratar consultor pra cada dúvida.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={target}
            className="inline-flex items-center gap-2 bg-terracotta text-paper px-5 py-3 rounded-sm font-mono text-xs uppercase tracking-[0.2em] font-bold shadow-[3px_3px_0_0_var(--ink)] hover:-translate-y-0.5 active:translate-y-0 transition-transform"
          >
            Começar agora <ArrowRight className="size-4" />
          </Link>
          <Link
            to={target}
            className="inline-flex items-center gap-2 border-2 border-ink px-5 py-3 rounded-sm font-mono text-xs uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-paper transition-colors"
          >
            Ver ferramentas
          </Link>
        </div>

        {/* Budget receipt card */}
        <div className="mt-12 ledger-card rounded-sm p-5 md:p-7 max-w-xl">
          <div className="flex items-center justify-between border-b border-ink/15 pb-3 mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
              Orçamento da semana
            </span>
            <span className="font-mono text-[10px] text-terracotta">#882-B</span>
          </div>
          <h3 className="font-display text-2xl mb-4">Reforma cozinha</h3>
          <div className="space-y-2 font-mono text-sm">
            {[
              ["Cimento", "14 sacos"],
              ["Tinta lavável", "12 L"],
              ["Piso porcelanato", "22 m²"],
              ["Rejunte epóxi", "3 kg"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-2"
              >
                <span className="text-ink/70">{k}</span>
                <span className="h-px flex-1 mx-1 border-b border-dotted border-ink/25 translate-y-[-3px]" />
                <span>{v}</span>
              </div>
            ))}
            <div className="pt-3 mt-3 border-t border-ink/15 flex items-baseline justify-between text-base font-bold text-terracotta">
              <span className="font-sans uppercase tracking-wider text-xs text-ink/60">
                Custo estimado
              </span>
              <span>R$ 4.180,00</span>
            </div>
          </div>
          <p className="mt-4 font-mono text-[10px] italic text-ink/50">
            Gerado pela IA da Obra · ObraFácil
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-5 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-terracotta" />
            <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-terracotta">
              O que você ganha
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl leading-tight tracking-tight max-w-[20ch]">
            Ferramentas pra cada etapa da obra.
          </h2>

          <div className="mt-10 grid md:grid-cols-2 gap-px bg-paper/10 border border-paper/10">
            {features.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-ink p-6 md:p-7 hover:bg-ink/60 transition-colors"
              >
                <Icon className="size-6 text-terracotta" strokeWidth={1.5} />
                <h3 className="font-display text-xl mt-4">{title}</h3>
                <p className="mt-2 text-sm text-paper/70 leading-relaxed text-pretty">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-paper border-t border-ink/15">
        <div className="mx-auto max-w-5xl px-5 py-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/60">
            ObraFácil AI · feito para quem ergue, reforma e cuida.
          </p>
        </div>
      </footer>
    </div>
  );
}
