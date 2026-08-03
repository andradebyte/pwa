"use client";

import { useState, useRef } from "react";
import LabShell from "@/components/labs/LabShell";

export default function IdleLab() {
  const [userState, setUserState] = useState<string | null>(null);
  const [screenState, setScreenState] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const start = async () => {
    setError(null);
    const ID = (window as any).IdleDetector;
    if (!ID) {
      setError("IdleDetector não suportado — só Chrome/Edge.");
      return;
    }
    try {
      const perm = await ID.requestPermission();
      if (perm !== "granted") {
        setError("Permissão negada.");
        return;
      }
      abortRef.current = new AbortController();
      const detector = new ID();
      detector.addEventListener("change", () => {
        setUserState(detector.userState);
        setScreenState(detector.screenState);
      });
      await detector.start({ threshold: 60000, signal: abortRef.current.signal });
      setUserState(detector.userState);
      setScreenState(detector.screenState);
      setRunning(true);
    } catch {
      setError("Falha ao iniciar o detector.");
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setRunning(false);
    setUserState(null);
    setScreenState(null);
  };

  return (
    <LabShell title="Inatividade" subtitle="IdleDetector">
      <div className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-4">
        {running ? (
          <>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Usuário</p>
              <p className="text-2xl font-semibold">{userState === "active" ? "Ativo" : "Ausente"}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Tela</p>
              <p className="text-2xl font-semibold">{screenState === "unlocked" ? "Desbloqueada" : "Bloqueada"}</p>
            </div>
            <p className="text-[10px] text-gray-400 px-8 text-center">
              Fique 60s sem tocar/mexer no mouse para ver mudar
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-300">Detector parado</p>
        )}
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <button
        onClick={running ? stop : start}
        className={`w-full py-3 rounded-xl text-sm font-medium active:scale-95 transition-transform ${
          running ? "border border-gray-200 text-gray-600" : "bg-black text-white"
        }`}
      >
        {running ? "Parar" : "Iniciar detector"}
      </button>
    </LabShell>
  );
}
