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

      <style>{`
        .chat-page {
          display: flex; flex-direction: column;
          height: 100vh; overflow: hidden;
          background: var(--bg-base);
        }

        /* Header */
        .chat-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.25rem;
          height: 58px; flex-shrink: 0;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(13,15,20,0.9);
          backdrop-filter: blur(12px);
          z-index: 10;
        }
        .chat-header-left  { display: flex; align-items: center; gap: 0.75rem; }
        .chat-header-right { display: flex; align-items: center; gap: 0.75rem; }
        .back-btn {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          text-decoration: none;
          transition: all 0.2s;
        }
        .back-btn:hover { color: var(--text-primary); border-color: var(--border); }
        .chat-brand-icon {
          width: 28px; height: 28px;
          background: var(--accent-subtle);
          border: 1px solid rgba(240,168,50,0.15);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
        }
        .chat-doc-name { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); letter-spacing:-0.01em; }
        .streaming-indicator {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.78rem; color: var(--accent);
          background: var(--accent-subtle);
          border: 1px solid rgba(240,168,50,0.15);
          padding: 0.3rem 0.7rem; border-radius: 20px;
          font-weight: 500;
        }
        .streaming-dot {
          width: 6px; height: 6px;
          background: var(--accent); border-radius: 50%;
          animation: pulse-ring 1s ease-in-out infinite;
        }
        .sidebar-toggle {
          display: flex; align-items: center; gap: 0.4rem;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; font-weight: 500;
          padding: 0.35rem 0.8rem;
          border-radius: 8px; cursor: pointer;
          transition: all 0.2s;
        }
        .sidebar-toggle:hover { color: var(--text-primary); border-color: var(--border); background: var(--bg-elevated); }
        .sidebar-toggle-active { color: var(--accent); border-color: rgba(240,168,50,0.3); background: var(--accent-subtle); }

        /* Body */
        .chat-body {
          display: flex; flex: 1; overflow: hidden;
        }

        /* Messages area */
        .chat-messages-wrap {
          flex: 1; display: flex; flex-direction: column; overflow: hidden;
        }
        .chat-messages {
          flex: 1; overflow-y: auto;
          padding: 2rem 1.5rem 1rem;
          max-width: 800px; width: 100%; margin: 0 auto;
        }

        /* Empty */
        .chat-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 60vh; gap: 0.75rem; text-align: center;
        }
        .chat-empty-icon {
          width: 60px; height: 60px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .chat-empty-title { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); letter-spacing:-0.02em; }
        .chat-empty-sub   { font-size: 0.87rem; color: var(--text-secondary); max-width: 320px; }
        .starter-chips {
          display: flex; flex-wrap: wrap; gap: 0.5rem;
          justify-content: center; margin-top: 0.75rem;
        }
        .starter-chip {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          padding: 0.5rem 1rem;
          border-radius: 20px; cursor: pointer;
          transition: all 0.2s;
        }
        .starter-chip:hover { color: var(--accent); border-color: rgba(240,168,50,0.3); background: var(--accent-subtle); }

        /* Messages */
        .messages-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .message-row { display: flex; gap: 0.75rem; align-items: flex-start; }
        .message-row-user { flex-direction: row-reverse; }
        .msg-avatar {
          width: 30px; height: 30px; flex-shrink: 0;
          background: var(--accent-subtle);
          border: 1px solid rgba(240,168,50,0.2);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          margin-top: 2px;
        }
        .message-bubble {
          max-width: 75%;
          padding: 0.9rem 1.1rem;
          border-radius: 14px;
          font-size: 0.9rem;
          line-height: 1.7;
        }
        .bubble-user {
          background: var(--accent);
          color: #0d0f14;
          font-weight: 500;
          border-radius: 14px 4px 14px 14px;
        }
        .bubble-assistant {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-radius: 4px 14px 14px 14px;
        }
        .prose-content p { margin-bottom: 0.5rem; }
        .prose-content p:last-child { margin-bottom: 0; }
        .prose-content code {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.1em 0.4em;
          font-size: 0.85em;
          color: var(--accent);
        }
        .prose-content ul, .prose-content ol { padding-left: 1.25rem; margin: 0.5rem 0; }
        .prose-content li { margin-bottom: 0.25rem; }

        /* Citation chips */
        .citation-chips {
          display: flex; flex-wrap: wrap; gap: 0.4rem;
          margin-top: 0.85rem; padding-top: 0.75rem;
          border-top: 1px solid var(--border-subtle);
        }
        .citation-chip {
          display: flex; align-items: center; gap: 0.4rem;
          background: var(--accent-subtle);
          border: 1px solid rgba(240,168,50,0.2);
          color: var(--accent);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem; font-weight: 600;
          padding: 0.25rem 0.65rem;
          border-radius: 20px; cursor: pointer;
          transition: all 0.2s;
        }
        .citation-chip:hover { background: rgba(240,168,50,0.15); box-shadow: 0 0 10px rgba(240,168,50,0.15); }
        .citation-num {
          width: 16px; height: 16px;
          background: var(--accent); color: #0d0f14;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 700;
        }

        /* Input */
        .chat-input-area {
          padding: 1rem 1.5rem 1.25rem;
          max-width: 800px; width: 100%; margin: 0 auto;
        }
        .chat-input-box {
          display: flex; align-items: flex-end; gap: 0.75rem;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 0.75rem 0.75rem 0.75rem 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .chat-input-box:focus-within {
          border-color: rgba(240,168,50,0.4);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .chat-input-box-streaming { opacity: 0.7; }
        .chat-textarea {
          flex: 1; background: none; border: none; outline: none;
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
          line-height: 1.6;
          max-height: 120px; overflow-y: auto;
        }
        .chat-textarea::placeholder { color: var(--text-muted); }
        .chat-textarea:disabled { cursor: not-allowed; }
        .send-btn {
          width: 36px; height: 36px; flex-shrink: 0;
          background: var(--accent); color: #0d0f14;
          border: none; border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(240,168,50,0.3);
        }
        .send-btn:hover:not(:disabled) {
          background: #f5b84a;
          transform: translateY(-1px);
          box-shadow: 0 4px 18px rgba(240,168,50,0.4);
        }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .input-hint { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.4rem; text-align: center; }

        /* Sidebar */
        .citation-sidebar {
          width: 320px; flex-shrink: 0;
          border-left: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }
        .sidebar-title { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em; }
        .sidebar-count {
          font-size: 0.72rem; color: var(--text-muted);
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          padding: 0.15rem 0.5rem; border-radius: 20px;
        }
        .sidebar-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0.75rem; padding: 2rem; text-align: center;
          color: var(--text-muted); font-size: 0.82rem; line-height: 1.6;
        }
        .sidebar-empty-icon {
          width: 44px; height: 44px;
          background: var(--bg-elevated); border: 1px solid var(--border);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
        }
        .sidebar-chunks {
          flex: 1; overflow-y: auto;
          padding: 0.75rem;
          display: flex; flex-direction: column; gap: 0.6rem;
        }
        .chunk-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius);
          padding: 0.9rem;
        }
        .chunk-header {
          display: flex; align-items: center; gap: 0.5rem;
          margin-bottom: 0.6rem;
        }
        .chunk-badge {
          font-size: 0.72rem; font-weight: 700;
          color: var(--accent); background: var(--accent-subtle);
          border: 1px solid rgba(240,168,50,0.2);
          padding: 0.15rem 0.5rem; border-radius: 20px;
        }
        .chunk-page {
          font-size: 0.72rem; color: var(--text-muted);
          background: var(--bg-overlay); padding: 0.15rem 0.5rem;
          border-radius: 20px;
        }
        .chunk-score {
          margin-left: auto;
          font-size: 0.7rem; color: var(--green);
          font-weight: 600;
        }
        .chunk-text {
          font-size: 0.78rem; color: var(--text-secondary);
          line-height: 1.65;
          display: -webkit-box; -webkit-line-clamp: 7;
          -webkit-box-orient: vertical; overflow: hidden;
        }
      `}</style>
    </div>
  );
}
