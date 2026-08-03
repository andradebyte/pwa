"use client";

import { useState } from "react";
import LabShell from "@/components/labs/LabShell";

type Device = { name: string; id: string };

export default function BluetoothLab() {
  const [device, setDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const scan = async () => {
    setBusy(true);
    setError(null);
    try {
      const bt = (navigator as any).bluetooth;
      if (!bt) throw new Error("unsupported");
      const d = await bt.requestDevice({ acceptAllDevices: true });
      setDevice({ name: d.name || "(sem nome)", id: d.id });
    } catch (e: any) {
      setError(
        e?.message === "unsupported" ? "Web Bluetooth não suportado neste browser."
        : e?.name === "NotFoundError" ? "Busca cancelada — nenhum dispositivo escolhido."
        : "Falha ao procurar dispositivos."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <LabShell title="Bluetooth" subtitle="navigator.bluetooth">
      <div className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-2 text-center px-6">
        {device ? (
          <>
            <p className="text-xl font-semibold">{device.name}</p>
            <p className="text-[10px] text-gray-400 break-all">{device.id}</p>
          </>
        ) : (
          <p className="text-sm text-gray-300">Nenhum dispositivo selecionado</p>
        )}
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <button
        onClick={scan}
        disabled={busy}
        className="w-full py-3 rounded-xl bg-black text-white text-sm font-medium active:scale-95 transition-transform disabled:opacity-40"
      >
        {busy ? "Procurando…" : "Procurar dispositivos"}
      </button>
    </LabShell>
  );
}
