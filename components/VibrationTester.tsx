"use client";

import { useState, useCallback } from "react";

const patterns: { label: string; ms: number | number[] }[] = [
  { label: "Curto",    ms: 100 },
  { label: "Médio",   ms: 400 },
  { label: "Longo",   ms: 1000 },
  { label: "Pulsos",  ms: [100, 80, 100, 80, 100] },
  { label: "SOS",     ms: [100,80,100,80,100, 200, 300,80,300,80,300, 200, 100,80,100,80,100] },
];

export default function VibrationTester() {
  const [active, setActive] = useState<string | null>(null);
  const [supported] = useState(() => typeof navigator !== "undefined" && "vibrate" in navigator);

  const vibrate = useCallback((label: string, ms: number | number[]) => {
    if (!supported) return;
    navigator.vibrate(ms);
    setActive(label);
    const total = Array.isArray(ms) ? ms.reduce((a, b) => a + b, 0) : ms;
    setTimeout(() => setActive(null), total + 50);
  }, [supported]);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Indicator */}
      <div className="relative w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-3">
        <div className={`transition-transform duration-75 ${active ? "scale-110" : "scale-100"}`}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={active ? "#000" : "#d1d5db"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="3" width="8" height="18" rx="2" />
            <line x1="4" y1="7" x2="4" y2="17" />
            <line x1="2" y1="9" x2="2" y2="15" />
            <line x1="20" y1="7" x2="20" y2="17" />
            <line x1="22" y1="9" x2="22" y2="15" />
          </svg>
        </div>
        <p className="text-xs font-medium text-gray-400">
          {active ? `Vibrando: ${active}` : supported ? "Escolha um padrão" : "Vibração não suportada"}
        </p>
      </div>

      {/* Pattern grid */}
      <div className="grid grid-cols-2 gap-2">
        {patterns.map(({ label, ms }) => (
          <button
            key={label}
            onClick={() => vibrate(label, ms)}
            disabled={!supported}
            className={`py-4 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
              active === label
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
            } disabled:opacity-40`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
