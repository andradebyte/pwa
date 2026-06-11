"use client";

import { useEffect, useState, useCallback } from "react";

type Status = "idle" | "busy" | "success" | "fail";

function randomBytes(n: number) {
  return crypto.getRandomValues(new Uint8Array(n));
}

function toB64(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function fromB64(s: string) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

export default function BiometricTest() {
  const [credId, setCredId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setCredId(localStorage.getItem("biometric-cred-id"));
  }, []);

  const start = useCallback(async () => {
    setStatus("busy");
    setMessage(null);

    // 1. Checa suporte ao clicar
    if (!window.PublicKeyCredential) {
      setStatus("fail");
      setMessage("Este browser não suporta WebAuthn.");
      return;
    }
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false);
    if (!available) {
      setStatus("fail");
      setMessage("Biometria não disponível neste dispositivo.");
      return;
    }

    try {
      // 2. Já tem credencial? Testa direto
      if (credId) {
        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge: randomBytes(32),
            allowCredentials: [{ type: "public-key", id: fromB64(credId) }],
            userVerification: "required",
            timeout: 60000,
          },
        });
        if (!assertion) throw new Error("Sem resposta.");
        setStatus("success");
        setMessage("Identidade verificada ✓");
        return;
      }

      // 3. Primeira vez: cadastra
      const cred = (await navigator.credentials.create({
        publicKey: {
          challenge: randomBytes(32),
          rp: { name: "PWA Teste" },
          user: {
            id: randomBytes(16),
            name: "teste@pwa.local",
            displayName: "Usuário de Teste",
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },   // ES256
            { type: "public-key", alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (!cred) throw new Error("Cadastro cancelado.");
      const id = toB64(cred.rawId);
      localStorage.setItem("biometric-cred-id", id);
      setCredId(id);
      setStatus("success");
      setMessage("Biometria cadastrada ✓ Clique de novo para testar.");
    } catch (e) {
      setStatus("fail");
      setMessage(
        e instanceof Error && e.name === "NotAllowedError"
          ? "Cancelado, negado ou tempo esgotado."
          : "Falha na operação biométrica."
      );
    }
  }, [credId]);

  const reset = useCallback(() => {
    localStorage.removeItem("biometric-cred-id");
    setCredId(null);
    setStatus("idle");
    setMessage(null);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Status card */}
      <div className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-3">
        <svg
          width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className={
            status === "success" ? "text-green-500"
            : status === "fail" ? "text-red-400"
            : status === "busy" ? "text-black animate-pulse"
            : "text-gray-300"
          }
        >
          <path d="M12 11c0 3.5-1 6.5-2.5 8.5" />
          <path d="M8.5 11a3.5 3.5 0 1 1 7 0c0 2.5-.5 5-1.5 7" />
          <path d="M5 11a7 7 0 1 1 14 0c0 1.5-.2 3-.5 4.5" />
          <path d="M2.5 8.5A10 10 0 0 1 12 3a10 10 0 0 1 9.5 5.5" />
        </svg>
        <p className="text-sm text-gray-500 text-center px-6">
          {message ?? (credId ? "Biometria cadastrada — toque em iniciar para testar." : "Toque em iniciar para começar.")}
        </p>
      </div>

      {/* Controls */}
      <button
        onClick={start}
        disabled={status === "busy"}
        className="w-full py-3 rounded-xl bg-black text-white text-sm font-medium active:scale-95 transition-transform disabled:opacity-40"
      >
        {status === "busy" ? "Aguardando…" : "Iniciar biometria"}
      </button>
      {credId && (
        <button
          onClick={reset}
          className="w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-600 active:scale-95 transition-transform"
        >
          Remover cadastro
        </button>
      )}
    </div>
  );
}
