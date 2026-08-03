"use client";

import { useState } from "react";
import LabShell from "@/components/labs/LabShell";

export default function UsbLab() {
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickUsb = async () => {
    setError(null);
    const usb = (navigator as any).usb;
    if (!usb) {
      setError("WebUSB não suportado neste browser.");
      return;
    }
    try {
      const d = await usb.requestDevice({ filters: [] });
      setInfo(`${d.manufacturerName ?? "?"} — ${d.productName ?? "?"} (vendor ${d.vendorId.toString(16)}, product ${d.productId.toString(16)})`);
    } catch {
      setError("Seleção cancelada ou nenhum dispositivo USB encontrado.");
    }
  };

  const pickSerial = async () => {
    setError(null);
    const serial = (navigator as any).serial;
    if (!serial) {
      setError("Web Serial não suportado neste browser.");
      return;
    }
    try {
      const port = await serial.requestPort();
      const i = port.getInfo();
      setInfo(`Porta serial — vendor ${i.usbVendorId?.toString(16) ?? "?"}, product ${i.usbProductId?.toString(16) ?? "?"}`);
    } catch {
      setError("Seleção cancelada ou nenhuma porta disponível.");
    }
  };

  return (
    <LabShell title="USB & Serial" subtitle="navigator.usb / navigator.serial">
      <div className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center px-6">
        {info ? (
          <p className="text-sm font-semibold text-center break-words">{info}</p>
        ) : (
          <p className="text-sm text-gray-300 text-center">Nenhum dispositivo selecionado</p>
        )}
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={pickUsb}
          className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-medium active:scale-95 transition-transform"
        >
          Procurar USB
        </button>
        <button
          onClick={pickSerial}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 active:scale-95 transition-transform"
        >
          Porta serial
        </button>
      </div>
    </LabShell>
  );
}
