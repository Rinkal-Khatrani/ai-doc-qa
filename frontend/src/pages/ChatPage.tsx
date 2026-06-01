// src/pages/ChatPage.tsx
import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useChatStream } from "../hooks/useChatStream";
import type { Citation } from "../types";
import ReactMarkdown from "react-markdown";

export default function ChatPage() {
  const { docId } = useParams<{ docId: string }>();
  const [input, setInput] = useState("");
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { messages, sendMessage, isStreaming } = useChatStream(docId!);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!docId) return null;

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-left">
          <Link to="/" className="back-btn" aria-label="Back to library">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div className="chat-brand-icon">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <path
                d="M8 10h10M8 15h16M8 20h12"
                stroke="var(--accent)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="24" cy="10" r="3" fill="var(--accent)" />
            </svg>
          </div>
          <span className="chat-doc-name font-display">Document Q&A</span>
        </div>
        <div className="chat-header-right">
          {isStreaming && (
            <div className="streaming-indicator animate-fade-in">
              <span className="streaming-dot" />
              Generating
            </div>
          )}
          <button
            className={`sidebar-toggle ${sidebarOpen ? "sidebar-toggle-active" : ""}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle sources panel"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
            Sources
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="chat-body">
        {/* Messages */}
        <div className="chat-messages-wrap">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty animate-fade-in">
                <div className="chat-empty-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <p className="chat-empty-title font-display">
                  Ask about your document
                </p>
                <p className="chat-empty-sub">
                  Every answer is grounded in your document with citations
                </p>
                <div className="starter-chips">
                  {[
                    "Summarize this document",
                    "What are the key points?",
                    "What conclusions are drawn?",
                  ].map((q) => (
                    <button
                      key={q}
                      className="starter-chip"
                      onClick={() => {
                        setInput(q);
                        inputRef.current?.focus();
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`message-row ${msg.role === "user" ? "message-row-user" : "message-row-assistant"} animate-fade-up`}
                  >
                    {msg.role === "assistant" && (
                      <div className="msg-avatar">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <path
                            d="M8 10h10M8 15h16M8 20h12"
                            stroke="var(--accent)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <circle cx="24" cy="10" r="3" fill="var(--accent)" />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`message-bubble ${msg.role === "user" ? "bubble-user" : "bubble-assistant"} ${msg.streaming ? "streaming-cursor" : ""}`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose-content">
                          <ReactMarkdown>
                            {msg.content || (msg.streaming ? " " : "…")}
                          </ReactMarkdown>
                          {/* Citations */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="citation-chips">
                              {msg.citations.map((c, ci) => (
                                <button
                                  key={c.id}
                                  className="citation-chip"
                                  onClick={() => {
                                    setActiveCitations(msg.citations!);
                                    setSidebarOpen(true);
                                  }}
                                >
                                  <span className="citation-num">{ci + 1}</span>
                                  {c.page_number
                                    ? `p.${c.page_number}`
                                    : `chunk ${c.chunk_index + 1}`}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>{msg.content}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={bottomRef} style={{ height: 1 }} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <div
              className={`chat-input-box ${isStreaming ? "chat-input-box-streaming" : ""}`}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about this document…"
                className="chat-textarea"
                rows={1}
                style={{ resize: "none" }}
                disabled={isStreaming}
              />
              <button
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
                className="send-btn btn-glow"
                aria-label="Send message"
              >
                {isStreaming ? (
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      border: "2px solid rgba(0,0,0,0.2)",
                      borderTopColor: "#0d0f14",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                ) : (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </div>
            <p className="input-hint">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Citation Sidebar */}
        {sidebarOpen && (
          <aside className="citation-sidebar animate-slide-in">
            <div className="sidebar-header">
              <span className="sidebar-title font-display">Sources</span>
              <span className="sidebar-count">
                {activeCitations.length} chunks
              </span>
            </div>
            {activeCitations.length === 0 ? (
              <div className="sidebar-empty">
                <div className="sidebar-empty-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <p>
                  Click a citation chip in any answer to see the source text
                </p>
              </div>
            ) : (
              <div className="sidebar-chunks">
                {activeCitations.map((c, i) => (
                  <div
                    key={c.id}
                    className="chunk-card animate-fade-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="chunk-header">
                      <span className="chunk-badge">[{i + 1}]</span>
                      {c.page_number && (
                        <span className="chunk-page">Page {c.page_number}</span>
                      )}
                      <span className="chunk-score">
                        {Math.round(c.score * 100)}% match
                      </span>
                    </div>
                    <p className="chunk-text">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
