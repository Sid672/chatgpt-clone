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
      className={`${open ? "w-64" : "w-16"} transition-all duration-300 flex flex-col min-h-screen`}
      style={{ background: "#181818", color: "#FFFFFF" }}
      aria-label="Conversations sidebar"
    >
      <div className="flex items-center justify-between px-3 pt-4 pb-2"
           style={{ background: "#181818", color: "#FFFFFF" }}>
        <button
          className="btn-icon"
          style={{ color: "#FFFFFF" }}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle sidebar"
        >
          {open ? "←" : "→"}
        </button>
        {open && (
          <button
            className="btn bg-[#10a37f] hover:bg-[#209d77] text-white text-sm shadow-md px-4 py-1 rounded-xl font-medium transition-colors duration-200"
            style={{ color: "#FFFFFF" }}
            onClick={onNew}
            aria-label="New chat"
          >
            + New Chat
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto mt-2" role="navigation"
        style={{ background: "#181818", color: "#FFFFFF" }}>
        {open && (
          <ul className="px-2 space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  className="w-full text-left px-3 py-2 rounded-lg transition-colors duration-150 font-normal hover:bg-[#282828] hover:font-semibold focus:bg-[#282828] focus:font-semibold"
                  style={{ background: "#181818", color: "#FFFFFF" }}
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


