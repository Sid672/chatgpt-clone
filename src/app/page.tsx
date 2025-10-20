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
  const { messages, reload, setMessages, append } = useChat({ 
    api: "/api/chat", 
    streamProtocol: "text"
  });
  
  // Local state for managing messages
  const [localMessages, setLocalMessages] = React.useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<{ id: string; title: string }[]>([]);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  // Only allow the model 'gemini-2.5-flash'
  const [model, setModel] = React.useState("gemini-2.5-flash");
  const [saveMemory, setSaveMemory] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Custom function to send messages with context
  const sendMessage = async (content: string, attachments: any[] = []) => {
    
    setIsLoading(true);
    
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      try {
        const res = await fetch("/api/conversations", { method: "POST" });
        const newConv = await res.json();
        setConversationId(newConv.id);
        setConversations((prev) => [newConv, ...prev]);
        activeConversationId = newConv.id;
      } catch (error) {
        setIsLoading(false);
        return;
      }
    }

    // Add the user message to the messages array
    const userMessage = { 
      id: `user-${Date.now()}`, 
      role: "user" as const, 
      content 
    };
    const updatedMessages = [...localMessages, userMessage];
    setLocalMessages(updatedMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({ role: msg.role, content: msg.content })),
          conversationId: activeConversationId,
          model,
          saveMemory,
          attachments
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      
      // Add the assistant message immediately with loading state
      const assistantMessage = { 
        id: `assistant-${Date.now()}`, 
        role: "assistant" as const, 
        content: "..." 
      };
      setLocalMessages([...updatedMessages, assistantMessage]);

      try {
        // Try to get the full response as text first (simpler approach)
        const fullText = await response.text();
        
        if (fullText && fullText.trim()) {
          setLocalMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === "assistant") {
              lastMessage.content = fullText;
            }
            return newMessages;
          });
        } else {
          // Remove the empty assistant message
          setLocalMessages(prev => prev.slice(0, -1));
        }
      } catch (error) {
        // Remove the empty assistant message
        setLocalMessages(prev => prev.slice(0, -1));
      }
    } catch (error) {
      // Remove the user message if there was an error
      setLocalMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

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
      if (!r.ok) return setLocalMessages([]);
      const loaded = (await r.json()) as { role: ChatMessage["role"]; content: string }[];
      setLocalMessages(loaded.map((m, i) => ({ id: `m-${i}`, role: m.role, content: m.content })));
    });
  }, [conversationId]);

  // Persist assistant messages as memory when enabled
  React.useEffect(() => {
    if (!saveMemory) return;
    // find the latest assistant message
    const last = localMessages.slice().reverse().find((m) => m.role === "assistant");
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
  <div className="sticky top-0 h-screen">
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
  </div>
  <section className="flex flex-col">
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background shadow-sm"
          // Removed border and added subtle shadow for flat look
        >
          <div className="font-semibold text-lg tracking-tight select-none" style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, letterSpacing: 0.1 }}>
            ChatGPT
          </div>
          {/* Settings button removed per request */}
        </div>
        <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-1" role="log" aria-live="polite">
          {localMessages.map((m: { id: string; role: ChatRole; content: string }, idx: number) => (
            <div key={m.id} className="max-w-3xl mx-auto">
              <MessageBubble
                role={m.role}
                content={m.content}
                isLastUser={m.role === "user" && idx === localMessages.length - 1}
                onEdit={(next) => {
                  const nextMessages = [...localMessages.slice(0, -1), { ...m, content: next }];
                  fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ conversationId, model, messages: nextMessages, saveMemory }),
                  }).then(() => reload());
                }}
              />
            </div>
          ))}
          {isLoading && (
            <div className="flex flex-row items-start max-w-3xl mx-auto">
              <div className="h-6 w-6 bg-white rounded-full ml-2 mt-3" />
            </div>
          )}
          {localMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mt-24">
              <div className="text-[28px] font-normal mb-6">What can I help with?</div>
              <ChatInput 
                onSend={sendMessage} 
                variant="hero" 
                width="40vw"
              />
            </div>
          )}
        </div>
        
        {/* Persistent chat input at bottom */}
        {localMessages.length > 0 && (
          <div className="sticky bottom-0 bg-background border-t border-[var(--border)] p-4">
            <div className="mx-auto" style={{ width: "40vw" }}>
              <ChatInput 
                onSend={sendMessage} 
                variant="inline" 
                width="100%"
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
