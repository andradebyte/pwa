"use client";

import { useState, useCallback, useRef } from "react";

type Position = {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  timestamp: number;
};

export default function GpsTracker() {
  const [position, setPosition] = useState<Position | null>(null);
  const [watching, setWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  const start = useCallback(() => {
    setError(null);
    if (!navigator.geolocation) {
      setError("GPS não disponível neste dispositivo.");
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        });
        setWatching(true);
      },
      (err) => {
        setError(
          err.code === 1
            ? "Permissão de localização negada."
            : "Não foi possível obter a localização."
        );
        setWatching(false);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    setWatching(true);
  }, []);

  const stop = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setWatching(false);
  }, []);

  const mapsUrl = position
    ? `https://www.google.com/maps?q=${position.lat},${position.lng}`
    : null;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Status card */}
      <div className="relative w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-4">
        {/* Pulse ring when watching */}
        {watching && (
          <span className="absolute top-4 right-4 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-30" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-black" />
          </span>
        )}

        {position ? (
          <div className="flex flex-col items-center gap-1 text-center px-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black mb-1">
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
            </svg>
            <p className="text-2xl font-semibold tabular-nums">{position.lat.toFixed(6)}</p>
            <p className="text-2xl font-semibold tabular-nums">{position.lng.toFixed(6)}</p>
            <p className="text-xs text-gray-400 mt-1">±{Math.round(position.accuracy)} m de precisão</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
            </svg>
            <span className="text-xs font-medium">Aguardando sinal</span>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      {/* Extra info */}
      {position && (
        <div className="grid grid-cols-2 gap-2">
          <InfoTile label="Altitude" value={position.altitude != null ? `${Math.round(position.altitude)} m` : "—"} />
          <InfoTile label="Velocidade" value={position.speed != null ? `${(position.speed * 3.6).toFixed(1)} km/h` : "—"} />
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!watching ? (
          <button
            onClick={start}
            className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-medium active:scale-95 transition-transform"
          >
            Iniciar GPS
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 active:scale-95 transition-transform"
          >
            Parar
          </button>
        )}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 text-center active:scale-95 transition-transform"
          >
            Ver no mapa
          </a>
        )}
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-base font-semibold mt-0.5">{value}</p>
    </div>
  );
}
