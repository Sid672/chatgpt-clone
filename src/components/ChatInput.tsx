"use client";
import { useCallback, useRef, useState, useEffect } from "react";
import { Paperclip, Image as ImageIcon, Lightbulb, Search, BookOpen, MoreHorizontal, Mic, Plus } from "lucide-react";
import Icon from "@/components/Icon";
import Dropzone from "react-dropzone";
import AttachmentPreview from "@/components/AttachmentPreview";

type Props = {
  onSend: (content: string, attachments: { url: string; type: string }[]) => void;
  variant?: "hero" | "inline";
};

export default function ChatInput({ onSend, variant = "inline" }: Props) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<{ url: string; type: string }[]>([]);
  const isSending = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return;
    const data = await res.json();
    setAttachments((prev) => [
      ...prev,
      { url: data.secure_url, type: data.resource_type || file.type },
    ]);
  }, []);

  const onDrop = useCallback((accepted: File[]) => {
    accepted.forEach((f) => void handleUpload(f));
  }, [handleUpload]);

  const send = useCallback(() => {
    if (!value.trim() || isSending.current) return;
    isSending.current = true;
    onSend(value.trim(), attachments);
    setValue("");
    setAttachments([]);
    isSending.current = false;
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

  return (
    <div className={hero ? "w-full" : "flex flex-col gap-2 p-2 border-t"}>
      <div className={hero ? "" : "mx-auto w-full"}>
        <div className={hero ? "mt-8" : ""}>
          <div className="pill-input-wrapper relative">
            <div className="pill-left relative" ref={menuRef}>
              <button
                className="btn-icon transition hover:brightness-110 hover:shadow-md"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Open quick actions"
              >
                <Plus size={18} />
              </button>
              <input
                className="input-plain"
                placeholder="Ask anything"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                aria-label="Chat message input"
                style={{ width: "100%", fontSize: "16px" }}
              />

              {menuOpen && (
                <div
                  className="absolute left-0 top-[52px] z-20 w-[320px] rounded-2xl border border-[var(--border)] bg-[#1f1f1f] shadow-xl"
                  role="menu"
                >
                  <ul className="py-2">
                    <li className="px-3">
                      <Dropzone onDrop={onDrop} multiple>
                        {({ getRootProps, getInputProps }) => (
                          <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#2a2a2a] transition" role="menuitem">
                              <Paperclip size={14} className="text-white/90" />
                              <span className="text-[14px]">Add photos & files</span>
                            </button>
                          </div>
                        )}
                      </Dropzone>
                    </li>

                    <li className="px-3">
                      <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#2a2a2a] transition" role="menuitem">
                        <ImageIcon size={14} className="text-white/90" />
                        <span className="text-[14px]">Create image</span>
                      </button>
                    </li>

                    <li className="px-3">
                      <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#2a2a2a] transition" role="menuitem">
                        <Lightbulb size={14} className="text-white/90" />
                        <span className="text-[14px]">Thinking</span>
                      </button>
                    </li>

                    <li className="px-3">
                      <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#2a2a2a] transition" role="menuitem">
                        <Search size={14} className="text-white/90" />
                        <span className="text-[14px]">Deep research</span>
                      </button>
                    </li>

                    <li className="px-3">
                      <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#2a2a2a] transition" role="menuitem">
                        <BookOpen size={14} className="text-white/90" />
                        <span className="text-[14px]">Study and learn</span>
                      </button>
                    </li>

                    <li className="px-3">
                      <button className="w-full flex items-center justify-between rounded-xl px-3 py-2 hover:bg-[#2a2a2a] transition" role="menuitem">
                        <span className="flex items-center gap-3"><MoreHorizontal size={14} className="text-white/90" /> <span className="text-[14px]">More</span></span>
                        <span className="opacity-60 text-[14px]"></span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button className="voice-btn transition hover:brightness-110 hover:shadow-md" onClick={send} aria-label="Send">
                <Mic size={18} />
              </button>
            </div>
          </div>

          <AttachmentPreview attachments={attachments} />
        </div>
      </div>
    </div>
  );
}


