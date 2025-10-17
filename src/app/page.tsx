"use client";
import React from "react";
import { useChat } from "@ai-sdk/react";
import ChatInput from "@/components/ChatInput";
import EditableMessage from "@/components/EditableMessage";
import Sidebar from "@/components/Sidebar";
import MessageBubble from "@/components/MessageBubble";
import SettingsModal from "@/components/SettingsModal";

export default function Home() {
  const { messages, append, reload, setMessages } = useChat({ api: "/api/chat", streamProtocol: "text" });
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<{ id: string; title: string }[]>([]);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [model, setModel] = React.useState("gpt-4o-mini");

  React.useEffect(() => {
    fetch("/api/conversations").then(async (r) => {
      if (!r.ok) return setConversations([]);
      setConversations(await r.json());
    });
  }, []);

  React.useEffect(() => {
    if (!conversationId) return;
    fetch(`/api/conversations/${conversationId}/messages`).then(async (r) => {
      if (!r.ok) return setMessages([] as any);
      const loaded = (await r.json()) as { role: string; content: string }[];
      setMessages(loaded.map((m, i) => ({ id: `m-${i}`, role: m.role as any, content: m.content })));
    });
  }, [conversationId, setMessages]);

  return (
    <main className="min-h-screen grid grid-cols-[auto_1fr]">
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} model={model} setModel={setModel} />
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
          className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
          style={{ borderBottom: `1px solid var(--border)`, background: "var(--background)" }}
        >
          <div className="font-semibold">ChatGPT</div>
          <button className="px-2 py-1 border rounded" onClick={() => setSettingsOpen(true)}>
            Settings
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-1" role="log" aria-live="polite">
          {messages.map((m: any, idx: number) => (
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
              <div className="text-3xl md:text-5xl font-semibold mb-6">What can I help with?</div>
              <ChatInput onSend={() => {}} variant="hero" />
            </div>
          )}
        </div>
        {/* Bottom chat input removed per request */}
      </section>
    </main>
  );
}
