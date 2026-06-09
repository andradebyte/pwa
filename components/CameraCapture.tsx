"use client";

import { useRef, useState, useCallback } from "react";

type Photo = { id: string; src: string };

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(ms);
      if (videoRef.current) videoRef.current.srcObject = ms;
    } catch {
      setError("Câmera não disponível.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }, [stream]);

  const takePhoto = useCallback(() => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    setPhotos((p) => [{ id: crypto.randomUUID(), src: c.toDataURL("image/jpeg", 0.85) }, ...p]);
  }, []);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((file) => {
      const r = new FileReader();
      r.onload = (ev) =>
        setPhotos((p) => [{ id: crypto.randomUUID(), src: ev.target?.result as string }, ...p]);
      r.readAsDataURL(file);
    });
    e.target.value = "";
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Viewfinder */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
        {stream ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <button
              onClick={takePhoto}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border-4 border-gray-200 shadow active:scale-95 transition-transform"
            />
            <button
              onClick={stopCamera}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-gray-400 text-sm"
            >
              ✕
            </button>
          </>
        ) : (
          <button
            onClick={startCamera}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300 hover:text-gray-400 transition-colors"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5l1.5-3h6l1.5 3H21a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-xs font-medium">Toque para abrir</span>
          </button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 16 12 12 8 16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
        Fazer upload
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              style={{ touchAction: "manipulation" }}
              onTouchEnd={() => setSelected(p.src)}
              onClick={() => setSelected(p.src)}
              className="aspect-square rounded-xl overflow-hidden bg-gray-50 cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" className="w-full h-full object-cover pointer-events-none" />
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selected} alt="" className="w-full h-full object-contain" />
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-black text-sm"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
