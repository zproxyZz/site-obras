import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutGrid,
  FolderOpen,
  Wrench,
  Calendar,
  Sparkles,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  exact?: boolean;
};

const navItems: NavItem[] = [
  { to: "/app", label: "Painel", icon: LayoutGrid, exact: true },
  { to: "/app/projetos", label: "Obras", icon: FolderOpen },
  { to: "/app/materiais", label: "Ferramentas", icon: Wrench },
  { to: "/app/agenda", label: "Agenda", icon: Calendar },
  { to: "/app/ia", label: "IA", icon: Sparkles },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Você saiu da sua conta.");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="pointer-events-none fixed inset-0 paper-grain opacity-60 z-0" />
      <header className="sticky top-0 z-40 bg-ink text-paper border-b border-paper/10">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link to="/app" className="flex flex-col leading-none">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-paper/60">
              Série v.03 · 2026
            </span>
            <span className="font-display italic text-xl mt-0.5">ObraFácil</span>
          </Link>
          <button
            aria-label="Sair"
            onClick={handleSignOut}
            className="size-10 grid place-items-center border border-paper/20 rounded-sm bg-paper/5 hover:bg-paper/10 transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-6 pb-28">
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-paper border-t-2 border-ink">
        <div className="mx-auto max-w-3xl px-2 py-2 grid grid-cols-5">
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-1.5 rounded-sm transition-colors ${
                  active ? "text-terracotta" : "text-ink/45 hover:text-ink"
                }`}
              >
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2.25 : 1.75}
                />
                <span
                  className={`text-[9px] font-mono uppercase tracking-[0.12em] ${
                    active ? "font-bold" : ""
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  meta,
}: {
  eyebrow?: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className="flex items-end justify-between border-b border-ink/15 pb-2 mb-4">
      <div>
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-terracotta">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl leading-tight mt-0.5">{title}</h2>
      </div>
      {meta && (
        <p className="font-mono text-[10px] uppercase text-ink/60 text-right">
          {meta}
        </p>
      )}
    </div>
  );
}

export function RuleHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h3 className="font-mono text-xs uppercase tracking-[0.22em] font-bold">
        {children}
      </h3>
      <div className="h-px flex-1 bg-ink/15" />
    </div>
  );
}