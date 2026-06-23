import { Construction } from "lucide-react";
import { SectionHeading } from "@/components/obrafacil/AppShell";

export function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="ledger-card rounded-sm p-8 text-center">
        <Construction
          className="size-10 mx-auto text-terracotta"
          strokeWidth={1.5}
        />
        <p className="font-display text-xl mt-4">Em construção</p>
        <p className="text-sm text-ink/65 mt-2 max-w-prose mx-auto leading-relaxed">
          {description}
        </p>
        <span className="inline-block mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
          Em breve nesta versão
        </span>
      </div>
    </div>
  );
}