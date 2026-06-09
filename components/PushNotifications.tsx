"use client";

import { useState, useEffect } from "react";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export default function PushNotifications() {
  const [permission, setPermission] = useState<PermissionState>("default");

  useEffect(() => {
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);
  }, []);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result as PermissionState);
  };

  const sendLocal = (title: string, body: string, icon = "/icons/icon-192x192.png") => {
    if (permission !== "granted") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) =>
        reg.showNotification(title, { body, icon, badge: icon })
      );
    } else {
      new Notification(title, { body, icon });
    }
  };

  const demos: { label: string; title: string; body: string }[] = [
    { label: "Lembrete",   title: "Lembrete",      body: "Não esqueça de verificar o app!" },
    { label: "Alerta",     title: "⚠️ Alerta",      body: "Ação necessária no sistema." },
    { label: "Mensagem",   title: "Nova mensagem",  body: "Você recebeu uma nova mensagem." },
    { label: "Atualização",title: "Atualização",    body: "O app foi atualizado com sucesso." },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Status card */}
      <div className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-3">
        <div className={`transition-all duration-300 ${permission === "granted" ? "scale-100" : "scale-90 opacity-40"}`}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
            stroke={permission === "granted" ? "#000" : "#d1d5db"}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>

        <div className="text-center">
          {permission === "unsupported" && (
            <p className="text-sm text-gray-400">Notificações não suportadas</p>
          )}
          {permission === "default" && (
            <p className="text-sm text-gray-400">Permissão não solicitada</p>
          )}
          {permission === "denied" && (
            <p className="text-sm text-red-400">Permissão bloqueada</p>
          )}
          {permission === "granted" && (
            <>
              <p className="text-sm font-medium">Notificações ativas</p>
              <p className="text-xs text-gray-400 mt-0.5">Toque em um padrão abaixo</p>
            </>
          )}
        </div>
      </div>

      {/* Permission button */}
      {permission === "default" && (
        <button
          onClick={requestPermission}
          className="w-full py-3 rounded-xl bg-black text-white text-sm font-medium active:scale-95 transition-transform"
        >
          Ativar notificações
        </button>
      )}

      {permission === "denied" && (
        <p className="text-xs text-center text-gray-400">
          Acesse as configurações do navegador para desbloquear notificações.
        </p>
      )}

      {/* Demo buttons */}
      {permission === "granted" && (
        <div className="grid grid-cols-2 gap-2">
          {demos.map(({ label, title, body }) => (
            <button
              key={label}
              onClick={() => sendLocal(title, body)}
              className="py-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 active:scale-95 transition-all hover:border-gray-400"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Push info box */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Push do servidor</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Para receber notificações enviadas pelo servidor (mesmo com o app fechado), é necessário
          configurar chaves VAPID e um endpoint de envio.
        </p>
        <code className="mt-1 text-[10px] bg-white border border-gray-200 rounded px-2 py-1 text-gray-600 select-all">
          npx web-push generate-vapid-keys
        </code>
      </div>
    </div>
  );
}
