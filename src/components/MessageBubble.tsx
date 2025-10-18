import EditableMessage from "@/components/EditableMessage";

type Props = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  isLastUser?: boolean;
  onEdit?: (value: string) => void;
};

export default function MessageBubble({ role, content, isLastUser, onEdit }: Props) {
  const isUser = role === "user";
  return (
    <div className="max-w-3xl mx-auto">
      <div className={`grid grid-cols-[40px_1fr] gap-4 py-2 items-start ${isUser ? 'justify-items-end' : ''}` }>
        <div className="flex justify-center pt-0.5">
          <div
            className={`h-8 w-8 rounded-full overflow-hidden flex items-center justify-center border shadow-sm bg-[#ececf1] dark:bg-[#444654] ${isUser ? 'border-[#ccc]' : 'border-[#19c37d]'}`}
            aria-hidden
          >
            {isUser ? (
              <span className="text-lg">🙂</span>
            ) : (
              <span className="text-lg" aria-label="OpenAI bot">🤖</span>
            )}
          </div>
        </div>
        <div>
          <div
            className={`rounded-xl px-5 py-3 whitespace-pre-wrap text-base font-normal shadow-sm border`}
            style={{
              background: isUser ? 'var(--user-bubble)' : 'var(--assistant-bubble)',
              borderColor: isUser ? '#e0e5ea' : 'var(--border)',
              boxShadow: '0px 1.5px 10px 0px rgba(0,0,0,0.03)',
            }}
          >
            {isUser && isLastUser && onEdit ? (
              <EditableMessage initial={content} onSave={onEdit} />
            ) : (
              content
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


