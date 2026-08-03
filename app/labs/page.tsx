"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lab = {
  href: string;
  title: string;
  desc: string;
  check: () => boolean;
  icon: React.ReactNode;
};

const LABS: Lab[] = [
  {
    href: "/labs/gps",
    title: "GPS",
    desc: "Localização em tempo real",
    check: () => "geolocation" in navigator,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    href: "/labs/compass",
    title: "Bússola",
    desc: "Orientação do dispositivo",
    check: () => "DeviceOrientationEvent" in window,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76" />
      </svg>
    ),
  },
  {
    href: "/labs/vibration",
    title: "Vibração",
    desc: "Padrões de vibração",
    check: () => "vibrate" in navigator,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="3" width="8" height="18" rx="2" />
        <line x1="4" y1="7" x2="4" y2="17" />
        <line x1="2" y1="9" x2="2" y2="15" />
        <line x1="20" y1="7" x2="20" y2="17" />
        <line x1="22" y1="9" x2="22" y2="15" />
      </svg>
    ),
  },
  {
    href: "/labs/bluetooth",
    title: "Bluetooth",
    desc: "Procurar dispositivos próximos",
    check: () => "bluetooth" in navigator,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
      </svg>
    ),
  },
  {
    href: "/labs/nfc",
    title: "NFC",
    desc: "Ler e gravar tags NFC",
    check: () => "NDEFReader" in window,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
        <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
        <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8" />
        <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
      </svg>
    ),
  },
  {
    href: "/labs/usb",
    title: "USB & Serial",
    desc: "Conectar hardware via cabo",
    check: () => "usb" in navigator || "serial" in navigator,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="7" r="1" />
        <circle cx="4" cy="20" r="1" />
        <path d="M4.7 19.3 19 5" />
        <path d="m21 3-3 1 2 2Z" />
        <path d="M9.26 7.68 5 12l2 5" />
        <path d="m10 14 5 2 3.5-3.5" />
        <path d="m18 12 1-1 1 1-1 1Z" />
      </svg>
    ),
  },
  {
    href: "/labs/speech",
    title: "Voz",
    desc: "Ditado e texto-para-fala",
    check: () => "speechSynthesis" in window,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
      </svg>
    ),
  },
  {
    href: "/labs/eyedropper",
    title: "Conta-gotas",
    desc: "Capturar cor de qualquer pixel",
    check: () => "EyeDropper" in window,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 22 1-1h3l9-9" />
        <path d="M3 21v-3l9-9" />
        <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
      </svg>
    ),
  },
  {
    href: "/labs/idle",
    title: "Inatividade",
    desc: "Detectar usuário ausente",
    check: () => "IdleDetector" in window,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function LabsPage() {
  const [available, setAvailable] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    setAvailable(Object.fromEntries(LABS.map((l) => [l.href, l.check()])));
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="px-1">
        <h1 className="text-lg font-semibold">Labs</h1>
        <p className="text-xs text-gray-400">APIs experimentais — disponibilidade varia por browser</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {LABS.map(({ href, title, desc, icon }) => {
          const ok = available?.[href];
          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className="flex flex-col gap-2 rounded-2xl bg-gray-50 border border-gray-100 p-4 active:scale-95 transition-transform"
            >
              <div className="flex items-start justify-between">
                <span className="text-gray-700">{icon}</span>
                {available && (
                  <span
                    className={`w-2 h-2 rounded-full mt-1 ${ok ? "bg-green-500" : "bg-gray-200"}`}
                    title={ok ? "Disponível" : "Não suportado"}
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-[11px] text-gray-400 leading-snug">{desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
