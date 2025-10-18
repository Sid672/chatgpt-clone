"use client";
import { useCallback, useRef, useState } from "react";
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
                <Icon name="plus" />
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
                      <Icon name="attach" />
                    </button>
                  </div>
                )}
              </Dropzone>

              <button className="btn-icon" aria-label="Search">
                <Icon name="search" />
              </button>

              <button className="btn" aria-label="Study">
                <Icon name="study" className="inline-block mr-2" />
                Study
              </button>

              <button className="voice-btn" onClick={send} aria-label="Voice">
                <Icon name="voice" />
              </button>
            </div>
          </div>

          <AttachmentPreview attachments={attachments} />
        </div>
      </div>
    </div>
  );
}


