"use client";

import { useState, useRef } from "react";
import LabShell from "@/components/labs/LabShell";

export default function SpeechLab() {
  const [text, setText] = useState("Olá! Este é um teste de voz do PWA.");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);

  const speak = () => {
    setError(null);
    if (!("speechSynthesis" in window)) {
      setError("Síntese de voz não suportada.");
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    speechSynthesis.speak(u);
  };

  const listen = () => {
    setError(null);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("Reconhecimento de voz não suportado neste browser.");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SR();
    recRef.current = rec;
    rec.lang = "pt-BR";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      setTranscript(Array.from(e.results).map((r: any) => r[0].transcript).join(""));
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e: any) => {
      setError(e.error === "not-allowed" ? "Permissão de microfone negada." : `Erro: ${e.error}`);
      setListening(false);
    };
    rec.start();
    setListening(true);
  };

  return (
    <LabShell title="Voz" subtitle="speechSynthesis / SpeechRecognition">
      {/* Texto-para-fala */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Texto para fala</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full rounded-xl bg-gray-50 border border-gray-100 p-3 text-sm resize-none focus:outline-none focus:border-gray-300"
        />
        <button
          onClick={speak}
          className="w-full py-3 rounded-xl bg-black text-white text-sm font-medium active:scale-95 transition-transform"
        >
          Falar
        </button>
      </div>

      {/* Ditado */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Ditado por voz</p>
        <div className="w-full min-h-24 rounded-xl bg-gray-50 border border-gray-100 p-3 flex items-center justify-center">
          {transcript ? (
            <p className="text-sm">{transcript}</p>
          ) : (
            <p className="text-sm text-gray-300">{listening ? "Ouvindo… fale algo" : "Nada transcrito ainda"}</p>
          )}
        </div>
        <button
          onClick={listen}
          className={`w-full py-3 rounded-xl text-sm font-medium active:scale-95 transition-transform ${
            listening ? "bg-red-500 text-white" : "border border-gray-200 text-gray-600"
          }`}
        >
          {listening ? "Parar" : "Ouvir"}
        </button>
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </LabShell>
  );
}
