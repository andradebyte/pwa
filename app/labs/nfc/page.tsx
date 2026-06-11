"use client";

import { useState, useRef } from "react";
import LabShell from "@/components/labs/LabShell";

export default function NfcLab() {
  const [log, setLog] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const append = (line: string) => setLog((l) => [line, ...l].slice(0, 20));

  const scan = async () => {
    setError(null);
    const NDEF = (window as any).NDEFReader;
    if (!NDEF) {
      setError("Web NFC não suportado — só funciona em Chrome no Android.");
      return;
    }
    try {
      abortRef.current = new AbortController();
      const reader = new NDEF();
      await reader.scan({ signal: abortRef.current.signal });
      setScanning(true);
      reader.onreading = (e: any) => {
        for (const record of e.message.records) {
          if (record.recordType === "text") {
            append(`Texto: ${new TextDecoder(record.encoding).decode(record.data)}`);
          } else if (record.recordType === "url") {
            append(`URL: ${new TextDecoder().decode(record.data)}`);
          } else {
            append(`Tag: ${e.serialNumber || "?"} (${record.recordType})`);
          }
        }
      };
      reader.onreadingerror = () => append("Tag detectada mas ilegível.");
    } catch {
      setError("Permissão negada ou NFC desligado.");
      setScanning(false);
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setScanning(false);
  };

  const write = async () => {
    setError(null);
    const NDEF = (window as any).NDEFReader;
    if (!NDEF) {
      setError("Web NFC não suportado — só funciona em Chrome no Android.");
      return;
    }
    try {
      await new NDEF().write("Olá do PWA! " + new Date().toLocaleTimeString());
      append("Gravado com sucesso ✓");
    } catch {
      setError("Falha ao gravar — aproxime uma tag NFC gravável.");
    }
  };

  return (
    <LabShell title="NFC" subtitle="NDEFReader">
      <div className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-2 px-6 overflow-y-auto">
        {log.length ? (
          <ul className="text-xs text-gray-600 flex flex-col gap-1 w-full">
            {log.map((l, i) => (
              <li key={i} className="border-b border-gray-100 pb-1 break-all">{l}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-300 text-center">
            {scanning ? "Aproxime uma tag NFC…" : "Nenhuma leitura ainda"}
          </p>
        )}
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={scanning ? stop : scan}
          className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-medium active:scale-95 transition-transform"
        >
          {scanning ? "Parar leitura" : "Ler tag"}
        </button>
        <button
          onClick={write}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 active:scale-95 transition-transform"
        >
          Gravar tag
        </button>
      </div>
    </LabShell>
  );
}
