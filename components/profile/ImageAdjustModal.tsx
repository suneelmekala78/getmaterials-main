"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import {
  DEFAULT_IMAGE_POS,
  FittedPhoto,
  normalizePos,
  type ImagePos,
} from "./FittedPhoto";

export function ImageAdjustModal({
  src,
  title,
  aspect = "square",
  initial,
  onCancel,
  onSave,
}: {
  src: string;
  title: string;
  aspect?: "square" | "banner";
  initial?: ImagePos | null;
  onCancel: () => void;
  onSave: (pos: ImagePos) => void;
}) {
  const [pos, setPos] = useState<ImagePos>(normalizePos(initial || DEFAULT_IMAGE_POS));
  const drag = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, posX: pos.x, posY: pos.y };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    const dx = ((event.clientX - drag.current.x) / box.width) * 100;
    const dy = ((event.clientY - drag.current.y) / box.height) * 100;
    setPos((current) => ({
      ...current,
      x: Math.min(100, Math.max(0, drag.current!.posX - dx)),
      y: Math.min(100, Math.max(0, drag.current!.posY - dy)),
    }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div
            className="touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <FittedPhoto
              src={src}
              pos={pos}
              className={
                aspect === "banner"
                  ? "w-full h-36 rounded-xl bg-slate-100 pointer-events-none"
                  : "w-40 h-40 mx-auto rounded-2xl bg-slate-100 pointer-events-none"
              }
            />
          </div>
          <p className="text-xs text-slate-400 text-center">Drag the preview or use the sliders to frame the photo.</p>
          <label className="block text-sm text-slate-600">
            Horizontal
            <input
              type="range"
              min={0}
              max={100}
              value={pos.x}
              onChange={(e) => setPos({ ...pos, x: Number(e.target.value) })}
              className="w-full accent-[var(--primary)]"
            />
          </label>
          <label className="block text-sm text-slate-600">
            Vertical
            <input
              type="range"
              min={0}
              max={100}
              value={pos.y}
              onChange={(e) => setPos({ ...pos, y: Number(e.target.value) })}
              className="w-full accent-[var(--primary)]"
            />
          </label>
          <label className="block text-sm text-slate-600">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={pos.zoom}
              onChange={(e) => setPos({ ...pos, zoom: Number(e.target.value) })}
              className="w-full accent-[var(--primary)]"
            />
          </label>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(pos)}
              className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
