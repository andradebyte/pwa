"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setDeferred(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // Sem prompt disponível e não é iOS (ex: Firefox, ou já instalado) — esconde
  if (!deferred && !isIOS) return null;

  return (
    <>
      <button
        onClick={install}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-black text-white text-sm font-medium active:scale-95 transition-transform"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Adicionar à tela inicial
      </button>

      {/* Guia iOS */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowIOSGuide(false)}>
          <div className="w-full bg-white rounded-t-3xl p-6 pb-10 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold text-center">Instalar no iPhone/iPad</p>
            <ol className="flex flex-col gap-3 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold shrink-0">1</span>
                Toque no botão <strong>Compartilhar</strong>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold shrink-0">2</span>
                Role e toque em <strong>Adicionar à Tela de Início</strong>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold shrink-0">3</span>
                Confirme tocando em <strong>Adicionar</strong>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 rounded-xl bg-black text-white text-sm font-medium"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
