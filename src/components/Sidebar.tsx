"use client";
import { useState } from "react";

type Conversation = { id: string; title: string };

type Props = {
  conversations?: Conversation[];
  onNew?: () => void;
  onSelect?: (id: string) => void;
};

export default function Sidebar({ conversations = [], onNew, onSelect }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`${open ? "w-64" : "w-12"} transition-all duration-200 flex flex-col`}
      style={{ background: "var(--sidebar)", borderRight: `1px solid var(--border)` }}
      aria-label="Conversations sidebar"
    >
      <div className="flex items-center justify-between px-2 py-2" style={{ borderBottom: `1px solid var(--border)` }}>
        <button
          className="px-2 py-1 text-sm border rounded"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle sidebar"
        >
          {open ? "←" : "→"}
        </button>
        {open && (
          <button
            className="px-2 py-1 text-sm border rounded"
            onClick={onNew}
            aria-label="New chat"
          >
            New chat
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto" role="navigation">
        {open && (
          <ul className="p-2 space-y-1">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  className="w-full text-left px-2 py-1 rounded hover:opacity-80"
                  style={{ background: "transparent" }}
                  onClick={() => onSelect?.(c.id)}
                >
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}


