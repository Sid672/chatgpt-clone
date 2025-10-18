"use client";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  model: string;
  setModel: (m: string) => void;
  saveMemory?: boolean;
  setSaveMemory?: (v: boolean) => void;
};

const MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"];

export default function SettingsModal({ open, onClose, model, setModel, saveMemory, setSaveMemory }: Props) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal>
      <div className="bg-white dark:bg-neutral-900 border rounded p-4 w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button className="border rounded px-2 py-1" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <label className="block text-sm mb-1">Model</label>
        <select
          className="w-full border rounded p-2"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <div className="mt-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!saveMemory} onChange={(e) => setSaveMemory?.(e.target.checked)} />
            <span className="text-sm">Save memory (store short facts from conversation)</span>
          </label>
        </div>
      </div>
    </div>
  );
}


