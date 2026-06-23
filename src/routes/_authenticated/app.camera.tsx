import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/obrafacil/AppShell";
import { Camera, Ruler } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/_authenticated/app/camera")({
  head: () => ({ meta: [{ title: "Câmera · ObraFácil" }] }),
  component: CameraTool,
});

type Point = { x: number; y: number };

function CameraTool() {
  const [img, setImg] = useState<string | null>(null);
  const [pts, setPts] = useState<Point[]>([]);
  const [ref, setRef] = useState("1");
  const imgRef = useRef<HTMLImageElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImg(url);
    setPts([]);
  }

  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!img || pts.length >= 2) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setPts((p) => [...p, { x, y }]);
  }

  const dist =
    pts.length === 2
      ? Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
      : 0;
  const real = pts.length === 2 ? (dist / 100) * (Number(ref) || 0) : 0;

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Visão" title="Medição por foto" meta="2 pontos" />

      <p className="text-xs text-ink/60 leading-relaxed">
        Tire/escolha uma foto, defina o tamanho conhecido (largura total da
        cena, em metros) e toque em <strong>2 pontos</strong> para estimar a
        distância entre eles.
      </p>

      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
          Largura real da cena (m)
        </span>
        <input
          type="number"
          step="0.01"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          className="mt-1 w-full bg-paper border-2 border-ink rounded-sm px-3 py-2 text-sm font-mono"
        />
      </label>

      <label className="block">
        <span className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2.5 rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] font-bold cursor-pointer">
          <Camera className="size-4" /> Escolher foto
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPick}
          className="hidden"
        />
      </label>

      {img && (
        <div
          className="relative border-2 border-ink rounded-sm overflow-hidden cursor-crosshair select-none"
          onClick={onClick}
        >
          <img ref={imgRef} src={img} alt="" className="block w-full" />
          {pts.map((p, i) => (
            <div
              key={i}
              className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-terracotta shadow"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            />
          ))}
          {pts.length === 2 && (
            <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line
                x1={pts[0].x}
                y1={pts[0].y}
                x2={pts[1].x}
                y2={pts[1].y}
                stroke="#C75D3B"
                strokeWidth="0.4"
                strokeDasharray="1 1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
        </div>
      )}

      {pts.length === 2 && (
        <div className="border-2 border-ink bg-ink text-paper rounded-sm p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/60 inline-flex items-center gap-1">
            <Ruler className="size-3" /> Distância estimada
          </p>
          <p className="font-display text-3xl mt-1">{real.toFixed(2)} m</p>
          <button
            onClick={() => setPts([])}
            className="mt-3 text-[10px] font-mono uppercase tracking-wider underline"
          >
            Refazer marcação
          </button>
        </div>
      )}
    </div>
  );
}