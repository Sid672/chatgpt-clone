"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Mic, Paperclip, ImageIcon, Lightbulb, Search, BookOpen, MoreHorizontal } from "lucide-react";
import Dropzone from "react-dropzone";

interface ChatInputProps {
  onSend: (content: string, attachments: any[]) => Promise<void>;
  variant?: "hero" | "inline";
  width?: string;
}

function useIsInputAtPageBottom(inputRef: React.RefObject<HTMLDivElement | null>) {
  const [atBottom, setAtBottom] = useState(false);
  useEffect(() => {
    function onResizeOrScroll() {
      if (!inputRef.current || typeof window === 'undefined') return;
      const rect = inputRef.current.getBoundingClientRect();
      setAtBottom(rect.bottom >= window.innerHeight - 16); // tolerance
    }
    
    // Only add event listeners on client side
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResizeOrScroll);
      window.addEventListener('scroll', onResizeOrScroll);
      onResizeOrScroll();
      return () => {
        window.removeEventListener('resize', onResizeOrScroll);
        window.removeEventListener('scroll', onResizeOrScroll);
      };
    }
  }, [inputRef]);
  return atBottom;
}

export default function ChatInput({ onSend, variant = "inline", width }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isSending = useRef(false);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const atBottom = useIsInputAtPageBottom(inputWrapRef);

  const handleUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      setAttachments((prev) => [...prev, { type: file.type, url: data.url, name: file.name }]);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }, []);

  const onDrop = useCallback((accepted: File[]) => {
    accepted.forEach((f) => void handleUpload(f));
  }, [handleUpload]);

  const send = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!value.trim() || isSending.current) return;
    isSending.current = true;
    try {
      // Capture current content and attachments, then clear input immediately
      const contentToSend = value.trim();
      const attachmentsToSend = attachments;
      setValue("");
      setAttachments([]);
      setMenuOpen(false);
      await onSend(contentToSend, attachmentsToSend);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      isSending.current = false;
    }
  }, [value, attachments, onSend]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const hero = variant === "hero";
  // In bottom (inline) mode we always want the menu to open upwards
  const openUpwards = variant === "inline" || atBottom;

  return (
    <div ref={inputWrapRef}
      className={hero ? "w-full" : "flex flex-col gap-2"}
      style={width ? { width } : undefined}
    >
      <div className={hero ? "" : "mx-auto w-full"}>
        <div className={hero ? "mt-8" : ""}>
          <form onSubmit={(e) => { e.preventDefault(); void send(e); }} className="relative w-full">
            <div
              className="flex items-center w-full h-12 rounded-2xl px-4"
              style={{
                background: '#303030',
                boxShadow: '0px 1px 8px 0px rgba(0,0,0,0.04)',
                border: 'none',
              }}
            >
              <button
                className="mr-2 flex-shrink-0 rounded-full hover:bg-[#353535] flex items-center justify-center transition"
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Open quick actions"
                tabIndex={-1}
                style={{ background: 'transparent', border: 'none', padding: '7px' }}
              >
                <Plus size={14} color="#ccc" />
              </button>
              <input
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 px-3 py-2"
                placeholder="Ask anything"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                aria-label="Chat message input"
                style={{ fontSize: '14px', color: '#fff', border: 'none', padding: '8px 12px', background: 'transparent' }}
              />
              <button
                className="ml-2 flex-shrink-0 rounded-full hover:bg-[#353535] flex items-center justify-center transition"
                type="submit"
                aria-label="Send"
                style={{ background: 'transparent', border: 'none', padding: '7px' }}
              >
                <Mic size={14} color="#fff" />
              </button>
            </div>

            {menuOpen && (
              <div
                ref={menuRef}
                className={`absolute left-0 ${openUpwards ? 'bottom-full mb-2' : 'top-[52px] mt-2'} z-20 w-[90vw] sm:w-[320px] max-w-[calc(100vw-16px)] rounded-2xl border border-[var(--border)] bg-[#222] shadow-xl max-h-[60vh] overflow-auto`}
                role="menu"
                style={{ minWidth: 240 }}
              >
                <ul className="py-2">
                  <li className="px-3">
                    <Dropzone onDrop={onDrop} multiple>
                      {({ getRootProps, getInputProps }: any) => (
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#262626] transition" role="menuitem">
                            <Paperclip size={14} className="text-white/90" />
                            <span className="text-[14px] text-gray-200">Add photos & files</span>
                          </button>
                        </div>
                      )}
                    </Dropzone>
                  </li>
                  <li className="px-3">
                    <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#262626] transition" role="menuitem">
                      <ImageIcon size={14} className="text-white/90" />
                      <span className="text-[14px] text-gray-200">Create image</span>
                    </button>
                  </li>
                  <li className="px-3">
                    <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#262626] transition" role="menuitem">
                      <Lightbulb size={14} className="text-white/90" />
                      <span className="text-[14px] text-gray-200">Thinking</span>
                    </button>
                  </li>
                  <li className="px-3">
                    <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#262626] transition" role="menuitem">
                      <Search size={14} className="text-white/90" />
                      <span className="text-[14px] text-gray-200">Deep research</span>
                    </button>
                  </li>
                  <li className="px-3">
                    <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#262626] transition" role="menuitem">
                      <BookOpen size={14} className="text-white/90" />
                      <span className="text-[14px] text-gray-200">Study and learn</span>
                    </button>
                  </li>
                  <li className="px-3">
                    <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#262626] transition" role="menuitem">
                      <MoreHorizontal size={14} className="text-white/90" />
                      <span className="text-[14px] text-gray-200">More</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="absolute -top-12 left-0 flex gap-2">
                {attachments.map((att, i) => (
                  <div key={i} className="bg-[#2a2a2a] rounded-lg px-2 py-1 text-xs text-white/80">
                    {att.name}
                  </div>
                ))}
              </div>
            )}
          </form>

          <AttachmentPreview attachments={attachments} />
        </div>
      </div>
    </div>
  );
}

function AttachmentPreview({ attachments }: { attachments: any[] }) {
  if (attachments.length === 0) return null;
  
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {attachments.map((att, i) => (
        <div key={i} className="bg-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white/80">
          {att.name}
        </div>
      ))}
    </div>
  );
}