import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar · ObraFácil" },
      {
        name: "description",
        content:
          "Acesse seu caderno de canteiro ObraFácil — projetos, materiais e cronograma num só lugar.",
      },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        toast.success("Cadastro feito! Já pode entrar.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Bem-vindo de volta.");
        navigate({ to: "/app" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha na autenticação";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/app",
    });
    if (result.error) {
      toast.error("Falha no login com Google");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/app" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 paper-grain opacity-70" />
      <header className="relative z-10 bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-paper/80 hover:text-paper">
            <ArrowLeft className="size-4" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Voltar</span>
          </Link>
          <div className="flex flex-col leading-none text-right">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-paper/60">
              Série v.03 · 2026
            </span>
            <span className="font-display italic text-xl mt-0.5">ObraFácil</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-md px-5 py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-10 bg-terracotta" />
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-terracotta">
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl leading-tight tracking-tight">
          {mode === "signin" ? "Abra seu caderno" : "Comece seu caderno"}
        </h1>
        <p className="mt-3 text-sm text-ink/70 leading-relaxed">
          {mode === "signin"
            ? "Acesse suas obras, orçamentos e ferramentas."
            : "Crie uma conta para salvar seus projetos com segurança."}
        </p>

        <div className="mt-8 ledger-card rounded-sm p-5 space-y-4">
          <button
            type="button"
            onClick={google}
            disabled={loading}
            className="w-full border-2 border-ink rounded-sm py-3 font-mono text-xs uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
          >
            Continuar com Google
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-ink/15" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
              ou
            </span>
            <div className="h-px flex-1 bg-ink/15" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
                E-mail
              </span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
                Senha
              </span>
              <input
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-terracotta text-paper px-5 py-3 rounded-sm font-mono text-xs uppercase tracking-[0.2em] font-bold shadow-[3px_3px_0_0_var(--ink)] hover:-translate-y-0.5 active:translate-y-0 transition-transform disabled:opacity-50"
            >
              {loading ? "Carregando…" : mode === "signin" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-xs text-ink/60">
            {mode === "signin" ? (
              <>
                Ainda não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-terracotta font-bold underline-offset-2 hover:underline"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-terracotta font-bold underline-offset-2 hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}