import { useState, useRef, useEffect } from "react";
import { useChatStream } from "../../hooks/useChatStream";
import type { Citation } from "../../types";
import ReactMarkdown from "react-markdown";
import { Send, Loader2 } from "lucide-react";

interface Props {
  docId: string;
  onCitationsChange: (citations: Citation[]) => void;
}

export default function ChatWindow({ docId, onCitationsChange }: Props) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isStreaming } = useChatStream(docId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-10">
            Ask a question about your document
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm
              ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 border border-gray-100 text-gray-800"
              }`}
            >
              {msg.role === "assistant" ? (
                <>
                  <ReactMarkdown>{msg.content || "..."}</ReactMarkdown>
                  {msg.streaming && (
                    <Loader2
                      size={14}
                      className="animate-spin mt-2 text-gray-400"
                    />
                  )}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-gray-200">
                      {msg.citations.map((c, ci) => (
                        <button
                          key={c.id}
                          onClick={() => onCitationsChange(msg.citations!)}
                          className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100"
                        >
                          [{ci + 1}]{c.page_number ? ` p.${c.page_number}` : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about this document..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="bg-blue-600 text-white rounded-xl px-4 py-2.5 hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
