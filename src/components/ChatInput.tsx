"use client";
import { useCallback, useRef, useState } from "react";
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

  const hero = variant === "hero";

  return (
    <div className={hero ? "w-full" : "flex flex-col gap-2 p-2 border-t"}>
      <div className={hero ? "" : "mx-auto w-full"}>
        <div className={hero ? "mt-8" : ""}>
          <div className="pill-input-wrapper">
            <div className="pill-left">
              <button className="btn-icon" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
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
                style={{ width: "100%" }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Dropzone onDrop={onDrop} multiple>
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <button className="btn-icon" aria-label="Attach">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05L12.53 20.96a5 5 0 0 1-7.07 0 5 5 0 0 1 0-7.07L14.12 5.3a3.5 3.5 0 0 1 4.95 0 3.5 3.5 0 0 1 0 4.95L10.6 19.7a1.5 1.5 0 0 1-2.12 0 1.5 1.5 0 0 1 0-2.12L17.83 8.4"/></svg>
                    </button>
                  </div>
                )}
              </Dropzone>

              <button className="btn-icon" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>

              <button className="btn" aria-label="Study">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>
                Study
              </button>

              <button className="voice-btn" onClick={send} aria-label="Voice">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v11"/><path d="M19 11a7 7 0 0 1-14 0"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
              </button>
            </div>
          </div>

          <AttachmentPreview attachments={attachments} />
        </div>
      </div>
    </div>
  );
}


