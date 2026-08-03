"use client";

import { useState, useEffect } from "react";

const CARDINALS = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];

export default function Compass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setError(null);
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      const result = await (DeviceOrientationEvent as any)
        .requestPermission()
        .catch(() => "denied");
      if (result !== "granted") {
        setError("Permissão de orientação negada.");
        return;
      }
    }
    setActive(true);
  };

  useEffect(() => {
    if (!active) return;

    const handler = (e: DeviceOrientationEvent) => {
      const h =
        (e as any).webkitCompassHeading ??
        (e.alpha !== null ? (360 - e.alpha) % 360 : null);
      if (h !== null) setHeading(Math.round(h));
    };

    window.addEventListener("deviceorientation", handler, true);
    return () => window.removeEventListener("deviceorientation", handler, true);
  }, [active]);

  const cardinal = heading !== null ? CARDINALS[Math.round(heading / 45) % 8] : null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="relative w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
        {/* Compass rose — rotates opposite to heading so N stays fixed */}
        <div
          className="w-64 h-64"
          style={{
            transform: heading !== null ? `rotate(${-heading}deg)` : undefined,
            transition: "transform 0.15s ease-out",
          }}
        >
          <svg viewBox="0 0 240 240" className="w-full h-full">
            <circle cx="120" cy="120" r="110" fill="none" stroke="#e5e7eb" strokeWidth="2" />

            {/* Tick marks */}
            {Array.from({ length: 72 }, (_, i) => {
              const angle = (i * 5 * Math.PI) / 180;
              const outer = 110;
              const inner = i % 18 === 0 ? 88 : i % 6 === 0 ? 96 : 103;
              const x1 = 120 + outer * Math.sin(angle);
              const y1 = 120 - outer * Math.cos(angle);
              const x2 = 120 + inner * Math.sin(angle);
              const y2 = 120 - inner * Math.cos(angle);
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={i % 18 === 0 ? "#9ca3af" : "#d1d5db"}
                  strokeWidth={i % 18 === 0 ? 2 : 1}
                />
              );
            })}

            {/* Cardinal labels */}
            <text x="120" y="24"  textAnchor="middle" fontSize="16" fontWeight="700" fill="#000">N</text>
            <text x="120" y="222" textAnchor="middle" fontSize="14" fontWeight="500" fill="#9ca3af">S</text>
            <text x="220" y="125" textAnchor="middle" fontSize="14" fontWeight="500" fill="#9ca3af">L</text>
            <text x="20"  y="125" textAnchor="middle" fontSize="14" fontWeight="500" fill="#9ca3af">O</text>

            {/* Needle */}
            <polygon points="120,28 114,120 120,108 126,120" fill="#000" />
            <polygon points="120,212 114,120 120,132 126,120" fill="#d1d5db" />
            <circle cx="120" cy="120" r="5" fill="#fff" stroke="#000" strokeWidth="2" />
          </svg>
        </div>

        {/* Fixed indicator at top */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-black rounded-full" />

        {/* Heading display */}
        <div className="absolute bottom-5 flex flex-col items-center gap-0.5">
          <p className="text-3xl font-semibold tabular-nums">
            {heading !== null ? `${heading}°` : "—"}
          </p>
          <p className="text-sm text-gray-400">{cardinal ?? "Aguardando"}</p>
        </div>
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      {!active ? (
        <button
          onClick={start}
          className="w-full py-3 rounded-xl bg-black text-white text-sm font-medium active:scale-95 transition-transform"
        >
          Ativar bússola
        </button>
      ) : (
        <button
          onClick={() => { setActive(false); setHeading(null); }}
          className="w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-600 active:scale-95 transition-transform"
        >
          Parar
        </button>
      )}
    </div>
  );
}
