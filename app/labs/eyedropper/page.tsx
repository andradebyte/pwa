"use client";

import { useState } from "react";
import LabShell from "@/components/labs/LabShell";

export default function EyedropperLab() {
  const [color, setColor] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pick = async () => {
    setError(null);
    const ED = (window as any).EyeDropper;
    if (!ED) {
      setError("EyeDropper não suportado — só Chrome/Edge desktop.");
      return;
    }
    try {
      const result = await new ED().open();
      setColor(result.sRGBHex);
      setHistory((h) => [result.sRGBHex, ...h.filter((c) => c !== result.sRGBHex)].slice(0, 8));
    } catch {
      // usuário cancelou com Esc — sem erro
    }
  };

  return (
    <LabShell title="Conta-gotas" subtitle="EyeDropper">
      <div
        className="w-full aspect-square rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2 transition-colors"
        style={{ backgroundColor: color ?? "#f9fafb" }}
      >
        {color ? (
          <span className="px-3 py-1.5 rounded-full bg-white/90 text-sm font-mono font-semibold shadow-sm">
            {color}
          </span>
        ) : (
          <p className="text-sm text-gray-300">Nenhuma cor capturada</p>
        )}
      </div>

      {history.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {history.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-9 h-9 rounded-lg border border-gray-200"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <button
        onClick={pick}
        className="w-full py-3 rounded-xl bg-black text-white text-sm font-medium active:scale-95 transition-transform"
      >
        Capturar cor
      </button>
    </LabShell>
  );
}
