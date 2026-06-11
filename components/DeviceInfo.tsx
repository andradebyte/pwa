"use client";

import { useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

type DeviceInfo = { label: string; platform: string };

type Sections = {
  tela:        Record<string, string>;
  sistema:     Record<string, string>;
  rede:        Record<string, string>;
  hardware:    Record<string, string>;
  input:       Record<string, string>;
  armazenamento: Record<string, string>;
  midia:       Record<string, string>;
  privacidade: Record<string, string>;
};

// ── Device parsing ─────────────────────────────────────────────────────────────

const BRANDS: [RegExp, string][] = [
  [/^SM-/i, "Samsung"], [/^moto|^XT\d/i, "Motorola"],
  [/^Redmi|^M\d{4}|^2[23]\d{3}/i, "Xiaomi"], [/^Pixel/i, "Google"],
  [/^POCO/i, "POCO"], [/^CPH\d|^OPPO/i, "OPPO"],
  [/^V\d{4}|^vivo/i, "Vivo"], [/^ONE[E ]A/i, "OnePlus"],
  [/^L[EM]-/i, "LG"], [/^[A-Z]{2,3}-[A-Z\d]{2,}|^NOV-|^ELS-/i, "Huawei"],
  [/^HTC/i, "HTC"], [/^A\d{4}/i, "ASUS"],
];
const WIN: Record<string, string> = { "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7" };

function parseUA(ua: string): DeviceInfo {
  if (/iPhone/i.test(ua)) {
    const v = ua.match(/iPhone OS (\d+_\d+)/i);
    return { label: "iPhone", platform: v ? `iOS ${v[1].replace("_", ".")}` : "iOS" };
  }
  if (/iPad/i.test(ua)) return { label: "iPad", platform: "iPadOS" };
  const am = ua.match(/Android[^;]*;\s*([^)]+)\)/i);
  if (am) {
    const model = am[1].replace(/\s+Build\/\S+/, "").trim();
    const brand = BRANDS.find(([re]) => re.test(model))?.[1] ?? "";
    const av = ua.match(/Android\s+(\d+(?:\.\d+)?)/i);
    return { label: brand ? `${brand} ${model}` : model, platform: av ? `Android ${av[1]}` : "Android" };
  }
  if (/Macintosh/i.test(ua)) {
    const v = ua.match(/Mac OS X ([\d_]+)/i);
    return { label: "Mac", platform: v ? `macOS ${v[1].replace(/_/g, ".")}` : "macOS" };
  }
  if (/Windows NT/i.test(ua)) {
    const v = ua.match(/Windows NT (\d+\.\d+)/i);
    return { label: "PC", platform: `Windows ${v ? (WIN[v[1]] ?? v[1]) : ""}`.trim() };
  }
  if (/Linux/i.test(ua)) return { label: "PC", platform: "Linux" };
  return { label: "Dispositivo desconhecido", platform: "" };
}

function parseBrowser(ua: string): string {
  if (/Edg\//i.test(ua))     return `Edge ${ua.match(/Edg\/(\d+)/i)?.[1] ?? ""}`.trim();
  if (/OPR\//i.test(ua))     return `Opera ${ua.match(/OPR\/(\d+)/i)?.[1] ?? ""}`.trim();
  if (/Chrome\//i.test(ua))  return `Chrome ${ua.match(/Chrome\/(\d+)/i)?.[1] ?? ""}`.trim();
  if (/Firefox\//i.test(ua)) return `Firefox ${ua.match(/Firefox\/(\d+)/i)?.[1] ?? ""}`.trim();
  if (/Safari\//i.test(ua))  return `Safari ${ua.match(/Version\/(\d+)/i)?.[1] ?? ""}`.trim();
  return "—";
}

// ── Sync helpers ───────────────────────────────────────────────────────────────

function mq(q: string) { return window.matchMedia(q).matches; }

function getWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl2 = c.getContext("webgl2");
    if (gl2) return { version: "WebGL 2", maxTex: `${gl2.getParameter(gl2.MAX_TEXTURE_SIZE)} px` };
    const gl = c.getContext("webgl") as WebGLRenderingContext | null;
    if (gl)  return { version: "WebGL 1", maxTex: `${gl.getParameter(gl.MAX_TEXTURE_SIZE)} px` };
  } catch {}
  return { version: "—", maxTex: "—" };
}

function getGPU() {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") ?? c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return "—";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "—";
  } catch { return "—"; }
}

function getCodecs() {
  if (typeof MediaRecorder === "undefined") return "—";
  const list = [
    ["VP9",  "video/webm;codecs=vp9"],
    ["VP8",  "video/webm;codecs=vp8"],
    ["AV1",  "video/webm;codecs=av1"],
    ["H.264","video/mp4;codecs=h264"],
    ["H.265","video/mp4;codecs=hvc1"],
  ];
  const ok = list.filter(([, t]) => MediaRecorder.isTypeSupported(t)).map(([n]) => n);
  return ok.length ? ok.join(", ") : "—";
}

function getPointerType() {
  if (mq("(pointer: fine)"))   return "Mouse / caneta";
  if (mq("(pointer: coarse)")) return "Touch";
  return "Nenhum";
}

function getColorGamut() {
  if (mq("(color-gamut: rec2020)")) return "Rec2020";
  if (mq("(color-gamut: p3)"))      return "DCI-P3";
  return "sRGB";
}

// ── Async helpers ──────────────────────────────────────────────────────────────

function getRefreshRate(): Promise<string> {
  return new Promise(resolve => {
    const times: number[] = [];
    function frame(t: number) {
      times.push(t);
      if (times.length < 12) { requestAnimationFrame(frame); return; }
      const diffs = times.slice(1).map((v, i) => v - times[i]);
      const avg = diffs.reduce((a, b) => a + b) / diffs.length;
      resolve(`${Math.round(1000 / avg)} Hz`);
    }
    requestAnimationFrame(frame);
  });
}

// ── UI ─────────────────────────────────────────────────────────────────────────

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold mt-0.5 break-words leading-snug">{value || "—"}</p>
    </div>
  );
}

function Section({ title, data }: { title: string; data: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(data).map(([label, value]) => (
          <Tile key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function DeviceInfo() {
  const [device, setDevice]     = useState<DeviceInfo | null>(null);
  const [sections, setSections] = useState<Sections | null>(null);
  const [loading, setLoading]   = useState(false);

  const patch = useCallback((key: keyof Sections, data: Record<string, string>) => {
    setSections(prev => prev ? { ...prev, [key]: { ...prev[key], ...data } } : prev);
  }, []);

  const detect = useCallback(async () => {
    setLoading(true);
    const nav = navigator as any;
    const ua  = navigator.userAgent;
    const webgl = getWebGL();

    // Sync — instant
    setDevice(parseUA(ua));
    setSections({
      tela: {
        "Resolução":    `${window.screen.width}×${window.screen.height}`,
        "Pixel ratio":  `${window.devicePixelRatio}x`,
        "Profund. cor": `${window.screen.colorDepth} bit`,
        "Gama de cor":  getColorGamut(),
        "HDR":          mq("(dynamic-range: high)") ? "Sim" : "Não",
        "Taxa (Hz)":    "calculando…",
      },
      sistema: {
        "Browser":      parseBrowser(ua),
        "Modo PWA":     mq("(display-mode: standalone)") ? "Instalado" : "Browser",
        "Tema":         mq("(prefers-color-scheme: dark)") ? "Escuro" : "Claro",
        "Idioma":       navigator.language,
        "Fuso horário": Intl.DateTimeFormat().resolvedOptions().timeZone,
        "Orientação":   screen.orientation?.type ?? "—",
        "Online":       navigator.onLine ? "Sim" : "Não",
      },
      rede: {
        "Tipo":         nav.connection?.effectiveType?.toUpperCase() ?? "—",
        "Velocidade":   nav.connection?.downlink ? `${nav.connection.downlink} Mbps` : "—",
        "Latência":     nav.connection?.rtt != null ? `${nav.connection.rtt} ms` : "—",
        "Economia":     nav.connection?.saveData ? "Ativada" : "Desativada",
      },
      hardware: {
        "CPU":          navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} núcleos` : "—",
        "RAM":          nav.deviceMemory ? `${nav.deviceMemory} GB` : "—",
        "GPU":          getGPU(),
        "WebGL":        webgl.version,
        "Tex. máx.":    webgl.maxTex,
        "Bluetooth":    "bluetooth" in navigator ? "Disponível" : "Não disponível",
        "USB":          "usb" in navigator ? "Disponível" : "Não disponível",
        "NFC":          "nfc" in navigator ? "Disponível" : "Não disponível",
        "JS Heap":      (performance as any).memory
                          ? `${((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB`
                          : "—",
      },
      input: {
        "Ponteiro":     getPointerType(),
        "Hover":        mq("(hover: hover)") ? "Sim" : "Não",
        "Touch pts":    `${navigator.maxTouchPoints}`,
        "Gamepad":      [...(navigator.getGamepads?.() ?? [])].filter(Boolean).length
                          ? `${[...(navigator.getGamepads())].filter(Boolean).length} conectado(s)`
                          : "Nenhum",
      },
      armazenamento: {
        "Bateria":      "detectando…",
        "Armazena.":    "calculando…",
      },
      midia: {
        "Câmeras":      "detectando…",
        "Codecs":       getCodecs(),
        "Notificações": typeof Notification !== "undefined" ? Notification.permission : "—",
      },
      privacidade: {
        "Do Not Track": navigator.doNotTrack === "1" ? "Ativado" : "Desativado",
        "Cookies":      navigator.cookieEnabled ? "Habilitados" : "Desabilitados",
      },
    });
    setLoading(false);

    // Async — update as they resolve
    await Promise.allSettled([
      // Client Hints
      (async () => {
        const h = await nav.userAgentData?.getHighEntropyValues(["model", "platform", "platformVersion"]);
        if (h?.model) setDevice({ label: h.model, platform: `${h.platform} ${h.platformVersion}`.trim() });
      })(),

      // Refresh rate
      getRefreshRate().then(hz => patch("tela", { "Taxa (Hz)": hz })),

      // Battery
      (async () => {
        const b = await nav.getBattery?.();
        if (!b) { patch("armazenamento", { "Bateria": "—" }); return; }
        const pct    = Math.round(b.level * 100);
        const status = b.charging
          ? "carregando"
          : b.dischargingTime !== Infinity
            ? `${Math.round(b.dischargingTime / 60)} min restantes`
            : "descarregando";
        patch("armazenamento", { "Bateria": `${pct}% — ${status}` });
      })(),

      // Storage
      (async () => {
        const est = await navigator.storage?.estimate();
        if (!est) { patch("armazenamento", { "Armazena.": "—" }); return; }
        const used  = ((est.usage  ?? 0) / 1024 / 1024).toFixed(1);
        const quota = ((est.quota  ?? 0) / 1024 / 1024 / 1024).toFixed(1);
        patch("armazenamento", { "Armazena.": `${used} MB / ${quota} GB` });
      })(),

      // Media devices
      (async () => {
        const devs = await navigator.mediaDevices?.enumerateDevices();
        if (!devs) { patch("midia", { "Câmeras": "—" }); return; }
        const cams = devs.filter(d => d.kind === "videoinput").length;
        const mics = devs.filter(d => d.kind === "audioinput").length;
        patch("midia", { "Câmeras": `${cams} câmera${cams !== 1 ? "s" : ""}, ${mics} mic${mics !== 1 ? "s" : ""}` });
      })(),
    ]);
  }, [patch]);

  const LABELS: [keyof Sections, string][] = [
    ["tela",          "Tela & Display"],
    ["sistema",       "Sistema"],
    ["rede",          "Rede"],
    ["hardware",      "Hardware"],
    ["input",         "Input"],
    ["armazenamento", "Armazenamento & Bateria"],
    ["midia",         "Mídia"],
    ["privacidade",   "Privacidade"],
  ];

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Hero */}
      <div className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-3">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <circle cx="12" cy="17" r="1" />
        </svg>
        {device ? (
          <div className="flex flex-col items-center gap-1 text-center px-6">
            <p className="text-2xl font-semibold">{device.label}</p>
            {device.platform && <p className="text-sm text-gray-400">{device.platform}</p>}
          </div>
        ) : (
          <p className="text-xs text-gray-300">Clique em identificar</p>
        )}
      </div>

      {/* Sections */}
      {sections && LABELS.map(([key, title]) => (
        <Section key={key} title={title} data={sections[key]} />
      ))}

      <button
        onClick={detect}
        disabled={loading}
        className="w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-600 active:scale-95 transition-transform disabled:opacity-40"
      >
        {loading ? "Identificando…" : device ? "Identificar novamente" : "Identificar"}
      </button>
    </div>
  );
}
