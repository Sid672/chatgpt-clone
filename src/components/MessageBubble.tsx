import EditableMessage from "@/components/EditableMessage";
import { Clipboard, ThumbsUp, ThumbsDown, Pencil } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  isLastUser?: boolean;
  onEdit?: (value: string) => void;
};

export default function MessageBubble({ role, content, isLastUser, onEdit }: Props) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showLiked, setShowLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showDisliked, setShowDisliked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };
  const handleLike = () => {
    if (!liked && !disliked) {
      setLiked(true);
      setShowLiked(true);
      setTimeout(() => setShowLiked(false), 1200);
    }
  };
  const handleDislike = () => {
    if (!liked && !disliked) {
      setDisliked(true);
      setShowDisliked(true);
      setTimeout(() => setShowDisliked(false), 1200);
    }
  };

  return (
    <div className={`max-w-3xl mx-auto ${isUser ? 'flex justify-end' : ''}`}>
      <div className={`py-2 items-start w-full ${isUser ? 'flex flex-row justify-end' : 'flex flex-col items-start'}`}>
        <div>
          <div
            className={`rounded-xl px-5 py-3 font-normal shadow-sm ${isUser ? '' : 'mb-1'}`}
            style={{
              userSelect: 'text',
              fontSize: '14px',
              background: isUser ? '#303030' : 'var(--assistant-bubble)',
              color: isUser ? '#fff' : undefined,
              border: 'none',
              whiteSpace: isUser ? 'pre-wrap' : undefined,
            }}
          >
            {isUser && isEditing && onEdit ? (
              <EditableMessage
                initial={content}
                onSave={(val) => {
                  setIsEditing(false);
                  onEdit(val);
                }}
              />
            ) : isUser ? (
              <>{content}</>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const { children, className, ...rest } = props;
                    return (
                      <code
                        className={`${className ? className : ''} rounded px-2 py-1 bg-[#222] text-[14px] whitespace-pre-wrap font-mono text-gray-200`}
                        style={{ fontSize: '14px' }}
                        {...rest}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre(props) {
                    return (
                      <pre
                        className="rounded-xl p-3 my-3 font-mono text-[14px] bg-[#18181a] overflow-x-auto text-gray-100"
                        style={{ fontSize: '14px' }}
                        {...props}
                      />
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            )}
          </div>
          {/* User message copy/edit (top-right), Assistant feedback/copy (bottom-left) */}
          {isUser ? (
            <div className="flex flex-row gap-2 items-center mt-1 justify-end">
              {/* Copy button for user message always available */}
              <button onClick={handleCopy} title="Copy" className="relative">
                <Clipboard className="w-3.5 h-3.5 text-gray-400 hover:text-white cursor-pointer" />
                {copied && <span className="absolute -bottom-6 right-0 bg-[#242424] text-white text-[12px] px-2 py-1 rounded">Copied!</span>}
              </button>
              {/* Edit button only for last user message, and if onEdit provided and not currently editing */}
              {isLastUser && onEdit && !isEditing && (
                <button onClick={() => setIsEditing(true)} title="Edit" className="relative">
                  <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-white cursor-pointer" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-row gap-3 items-center mt-1 ml-2">
              <button onClick={handleCopy} title="Copy" className="relative">
                <Clipboard className="w-3.5 h-3.5 text-gray-400 hover:text-white cursor-pointer" />
                {copied && <span className="absolute -bottom-6 left-0 bg-[#242424] text-white text-[12px] px-2 py-1 rounded">Copied!</span>}
              </button>
              {!disliked && (
                <button onClick={handleLike} title="Like" disabled={liked} className={`relative transition-colors rounded-full`} style={{ padding: '2px' }}>
                  <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'text-white fill-white' : 'text-gray-400 hover:text-white'} cursor-pointer`} fill={liked ? 'white' : 'none'} />
                  {showLiked && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#242424] text-white text-[12px] px-2 py-1 rounded">Liked!</span>}
                </button>
              )}
              {!liked && (
                <button onClick={handleDislike} title="Dislike" disabled={disliked} className={`relative transition-colors rounded-full`} style={{ padding: '2px' }}>
                  <ThumbsDown className={`w-3.5 h-3.5 ${disliked ? 'text-white fill-white' : 'text-gray-400 hover:text-white'} cursor-pointer`} fill={disliked ? 'white' : 'none'} />
                  {showDisliked && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#242424] text-white text-[12px] px-2 py-1 rounded">Disliked!</span>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


