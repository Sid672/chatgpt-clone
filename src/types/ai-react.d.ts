declare module "@ai-sdk/react" {
  export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system" | "tool";
    content: string;
  }

  export function useChat(args?: {
    api?: string;
    streamProtocol?: "data" | "text";
  }): {
    messages: ChatMessage[];
    append: (message: { role: ChatMessage["role"]; content: string }) => void;
    reload: () => void;
    isLoading: boolean;
    setMessages: (next: ChatMessage[]) => void;
  };
}


