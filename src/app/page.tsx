"use client";
import React from "react";
import { useChat } from "@ai-sdk/react";
import type { ChatMessage } from "@ai-sdk/react";
import ChatInput from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";
import MessageBubble from "@/components/MessageBubble";
import SettingsModal from "@/components/SettingsModal";

import type { ChatRole } from "@/models/Message";

export default function Home() {
  const { messages, reload, setMessages } = useChat({ api: "/api/chat", streamProtocol: "text" });
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<{ id: string; title: string }[]>([]);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [model, setModel] = React.useState("gpt-4o-mini");
  const [saveMemory, setSaveMemory] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/conversations").then(async (r) => {
      if (!r.ok) return setConversations([]);
      const data = (await r.json()) as { id: string; title: string }[];
      setConversations(data);
    });
  }, []);

  React.useEffect(() => {
    if (!conversationId) return;
    fetch(`/api/conversations/${conversationId}/messages`).then(async (r) => {
      if (!r.ok) return setMessages([] as ChatMessage[]);
      const loaded = (await r.json()) as { role: ChatMessage["role"]; content: string }[];
      setMessages(loaded.map((m, i) => ({ id: `m-${i}`, role: m.role, content: m.content })));
    });
  }, [conversationId, setMessages]);

  // Persist assistant messages as memory when enabled
  React.useEffect(() => {
    if (!saveMemory) return;
    // find the latest assistant message
    const last = messages.slice().reverse().find((m) => m.role === "assistant");
    if (!last) return;
    // best-effort: post to /api/memory
    void fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conversationId || "default", content: last.content }),
    });
  }, [messages, saveMemory, conversationId]);

  return (
    <main className="min-h-screen grid grid-cols-[auto_1fr]">
  <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} model={model} setModel={setModel} saveMemory={saveMemory} setSaveMemory={setSaveMemory} />
      <Sidebar
        conversations={conversations}
        onNew={async () => {
          const res = await fetch("/api/conversations", { method: "POST" });
          const c = await res.json();
          setConversations((prev) => [c, ...prev]);
          setConversationId(c.id);
        }}
        onSelect={(id) => setConversationId(id)}
      />
      <section className="flex flex-col">
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background shadow-sm"
          // Removed border and added subtle shadow for flat look
        >
          <div className="font-semibold text-lg tracking-tight select-none" style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, letterSpacing: 0.1 }}>
            ChatGPT
          </div>
          <button className="btn-icon bg-[#ececf1] hover:bg-[#dadbdd] dark:bg-[#353740] dark:hover:bg-[#444654] border-none shadow-none text-base" style={{ color: 'var(--foreground)' }}
            onClick={() => setSettingsOpen(true)} aria-label="Settings">
            <span className="sr-only">Open settings</span>
            ⚙️
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-1" role="log" aria-live="polite">
          {messages.map((m: { id: string; role: ChatRole; content: string }, idx: number) => (
            <div key={m.id} className="max-w-3xl mx-auto">
              <MessageBubble
                role={m.role}
                content={m.content}
                isLastUser={m.role === "user" && idx === messages.length - 1}
                onEdit={(next) => {
                  const nextMessages = [...messages.slice(0, -1), { ...m, content: next }];
                  fetch("/api/chat", {
                    method: "POST",
                    body: JSON.stringify({ conversationId, model, messages: nextMessages }),
                  }).then(() => reload());
                }}
              />
            </div>
          ))}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mt-24">
              <div className="text-[28px] font-semibold mb-6">What can I help with?</div>
              <ChatInput onSend={() => {}} variant="hero" />
            </div>
          )}
        </div>
        {/* Bottom chat input removed per request */}
      </section>
    </main>
  );
}
