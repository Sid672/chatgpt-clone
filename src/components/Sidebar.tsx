"use client";
import { useState } from "react";
import { NotebookPen, Search, Library, FolderOpen, Component } from 'lucide-react';

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
      className={`transition-all duration-300 flex flex-col min-h-screen ${open ? 'w-64' : 'w-16'}`}
      style={{ background: open ? '#181818' : '#212121', color: '#FFFFFF' }}
      aria-label="Conversations sidebar"
    >
      {/* Branding and toggle row */}
      <div className="flex items-center justify-between px-3 pt-4 pb-2">
        <div className="flex items-center">
          <img src="/gpt-icon.webp" alt="GPT" width={32} height={32} />
        </div>
        <button
          className="ml-auto btn-icon text-[#10a37f]"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle sidebar"
        >
          <svg width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="12" height="12" rx="3" stroke="#10a37f" strokeWidth="2"/></svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 mt-4">
        <ul className="flex flex-col gap-1 px-1">
          {/* New Chat - with notebox icon and tooltip shortcut */}
          <li>
            <button
              className="group flex items-center w-full px-2 py-2 rounded-lg hover:bg-[#232323] focus:bg-[#232323] transition font-medium relative text-[14px]"
              onClick={onNew}
              aria-label="New chat"
            >
              <NotebookPen className="mr-3 flex-shrink-0" size={20} />
              {open && <>
                <span>New chat</span>
                <span className="ml-auto bg-[#222] border border-[#333] rounded px-2 py-0.5 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Ctrl + Shift + O
                </span>
              </>}
            </button>
          </li>

          {/* Search Chats */}
          <li>
            <button
              className="flex items-center w-full px-2 py-2 rounded-lg hover:bg-[#232323] focus:bg-[#232323] transition font-medium text-[14px]"
              // Placeholder onClick for search
              onClick={() => {}}
            >
              <Search className="mr-3 flex-shrink-0" size={20} />
              {open && <span>Search chats</span>}
            </button>
          </li>

          {/* Library */}
          <li>
            <button
              className="flex items-center w-full px-2 py-2 rounded-lg hover:bg-[#232323] focus:bg-[#232323] transition font-medium text-[14px]"
              onClick={() => {}}
            >
              <Library className="mr-3 flex-shrink-0" size={20} />
              {open && <span>Library</span>}
            </button>
          </li>

          {/* Projects */}
          <li>
            <button
              className="flex items-center w-full px-2 py-2 rounded-lg hover:bg-[#232323] focus:bg-[#232323] transition font-medium text-[14px]"
              onClick={() => {}}
            >
              <FolderOpen className="mr-3 flex-shrink-0" size={20} />
              {open && <span>Projects</span>}
            </button>
          </li>
        </ul>

        {/* Divider and GPTs */}
        <div className={`mt-6 px-2 text-xs font-semibold text-gray-400 tracking-wide ${open ? '' : 'hidden'}`}>GPTs</div>
        <ul className="flex flex-col gap-1 px-1 mt-1">
          <li>
            <button
              className="flex items-center w-full px-2 py-2 rounded-lg hover:bg-[#232323] focus:bg-[#232323] transition font-medium text-[14px]"
              onClick={() => {}}
            >
              <Component className="mr-3 flex-shrink-0" size={20} />
              {open && <span>Explore</span>}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}


