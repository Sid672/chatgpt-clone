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
      <div className="grid grid-cols-[40px_1fr] gap-3 py-3">
        <div className="flex justify-center">
          <div
            className={`h-8 w-8 rounded overflow-hidden flex items-center justify-center border`}
            aria-hidden
          >
            {isUser ? (
              <span className="text-xs">🧑</span>
            ) : (
              <span className="text-xs">🤖</span>
            )}
          </div>
        </div>
        <div>
          <div
            className={`rounded-md px-3 py-2 whitespace-pre-wrap border`}
            style={{
              background: isUser ? "var(--user-bubble)" : "var(--assistant-bubble)",
              borderColor: "var(--border)",
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


