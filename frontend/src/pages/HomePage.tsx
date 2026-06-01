// src/pages/HomePage.tsx
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
} from "../hooks/useDocuments";
import { useAuthStore } from "../store/authStore";
import type { Document } from "../types";
import { DeleteConfirmModal } from "../components/deleteConfirmModal/DeleteConfirmModal";

export default function HomePage() {
  const { logout } = useAuthStore();
  const { data: docs = [], isLoading } = useDocuments();
  const { mutate: upload, isPending } = useUploadDocument();
  const { mutate: deleteDoc } = useDeleteDocument();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [confirmDoc, setConfirmDoc] = useState<Document | null>(null);

  const handleDelete = async () => {
    if (!confirmDoc) return;
    setDeletingId(confirmDoc.id);
    deleteDoc(confirmDoc.id, {
      onSettled: () => {
        setDeletingId(null);
        setConfirmDoc(null);
      },
    });
  };

  const onDrop = useCallback(
    (files: File[]) => {
      files.forEach((f) => upload(f));
    },
    [upload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: true,
  });

  const processingCount = docs.filter((d) => d.status === "processing").length;
  const readyCount = docs.filter((d) => d.status === "ready").length;

  return (
    <div className="home-page">
      {/* Ambient background */}
      <div className="home-ambient" />

      {/* Header */}
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-brand">
            <div className="home-brand-icon">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path
                  d="M8 10h10M8 15h16M8 20h12"
                  stroke="var(--accent)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="24" cy="10" r="3" fill="var(--accent)" />
              </svg>
            </div>
            <span className="home-brand-name font-display">DocChat</span>
          </div>
          <div className="home-header-right">
            {processingCount > 0 && (
              <div className="processing-pill animate-fade-in">
                <span className="processing-dot" />
                {processingCount} processing
              </div>
            )}
            <button onClick={logout} className="btn-ghost">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="home-main">
        {/* Hero text */}
        <div className="home-hero animate-fade-up">
          <h1 className="home-title font-display">
            Chat with your <span className="title-accent">documents</span>
          </h1>
          <p className="home-subtitle">
            Upload a PDF, DOCX, or TXT — ask anything and get cited answers
            instantly.
          </p>
        </div>

        {/* Stats row */}
        {docs.length > 0 && (
          <div className="stats-row animate-fade-up stagger">
            <div className="stat-chip">
              <span className="stat-num">{docs.length}</span>
              <span className="stat-label">documents</span>
            </div>
            <div className="stat-chip">
              <span className="stat-num" style={{ color: "var(--green)" }}>
                {readyCount}
              </span>
              <span className="stat-label">ready</span>
            </div>
            {processingCount > 0 && (
              <div className="stat-chip">
                <span className="stat-num" style={{ color: "var(--accent)" }}>
                  {processingCount}
                </span>
                <span className="stat-label">processing</span>
              </div>
            )}
          </div>
        )}

        {/* Upload zone */}
        <div
          className="upload-zone-wrapper animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div
            {...getRootProps()}
            className={`upload-zone ${isDragActive ? "upload-zone-active" : ""} ${isPending ? "upload-zone-uploading" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="upload-icon-wrap">
              {isPending ? (
                <div className="upload-spinner" />
              ) : (
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
            </div>
            <div className="upload-text">
              {isPending ? (
                <span>Uploading & processing…</span>
              ) : isDragActive ? (
                <span>Drop files here</span>
              ) : (
                <>
                  <span className="upload-cta">
                    Drop files or <span className="upload-link">browse</span>
                  </span>
                  <span className="upload-hint">
                    PDF · DOCX · TXT — multiple files supported
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Document list */}
        {isLoading ? (
          <div className="doc-list stagger">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="doc-card shimmer"
                style={{ height: "72px", animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
        ) : docs.length > 0 ? (
          <div
            className="doc-list stagger animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            {docs.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                onOpen={() =>
                  doc.status === "ready" && navigate(`/chat/${doc.id}`)
                }
                onRequestDelete={() => setConfirmDoc(doc)} // opens modal
                isDeleting={deletingId === doc.id}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state animate-fade-in">
            <div className="empty-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <p className="empty-title">No documents yet</p>
            <p className="empty-sub">Upload a file above to get started</p>
          </div>
        )}
      </main>

      {confirmDoc && (
        <DeleteConfirmModal
          doc={confirmDoc}
          isDeleting={!!deletingId}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDoc(null)}
        />
      )}
      <style>{`
        .home-page {
          min-height: 100vh;
          background: var(--bg-base);
          position: relative;
          overflow-x: hidden;
        }
        .home-ambient {
          position: fixed;
          top: -200px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(240,168,50,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Header */
        .home-header {
          position: sticky; top: 0; z-index: 100;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(13,15,20,0.85);
          backdrop-filter: blur(16px);
        }
        .home-header-inner {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .home-brand { display: flex; align-items: center; gap: 0.6rem; }
        .home-brand-icon {
          width: 34px; height: 34px;
          background: var(--accent-subtle);
          border: 1px solid rgba(240,168,50,0.2);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .home-brand-name {
          font-size: 1rem; font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .home-header-right { display: flex; align-items: center; gap: 1rem; }
        .processing-pill {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(240,168,50,0.1);
          border: 1px solid rgba(240,168,50,0.2);
          border-radius: 20px;
          padding: 0.3rem 0.75rem;
          font-size: 0.78rem;
          color: var(--accent);
          font-weight: 500;
        }
        .processing-dot {
          width: 6px; height: 6px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse-ring 1.5s ease-in-out infinite;
        }
        .btn-ghost {
          background: none; border: none;
          color: var(--text-secondary);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius);
          transition: color 0.2s, background 0.2s;
        }
        .btn-ghost:hover { color: var(--text-primary); background: var(--bg-elevated); }

        /* Main */
        .home-main {
          max-width: 720px;
          margin: 0 auto;
          padding: 3rem 1.5rem 4rem;
          position: relative; z-index: 1;
        }

        /* Hero */
        .home-hero { margin-bottom: 2.5rem; }
        .home-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }
        .title-accent {
          color: var(--accent);
          position: relative;
        }
        .home-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
          max-width: 480px;
          line-height: 1.7;
        }

        /* Stats */
        .stats-row {
          display: flex; gap: 0.75rem;
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
        }
        .stat-chip {
          display: flex; align-items: center; gap: 0.5rem;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 0.3rem 0.9rem;
          font-size: 0.82rem;
        }
        .stat-num { font-weight: 600; color: var(--text-primary); font-variant-numeric: tabular-nums; }
        .stat-label { color: var(--text-muted); }

        /* Upload zone */
        .upload-zone-wrapper { margin-bottom: 2rem; }
        .upload-zone {
          border: 1.5px dashed var(--border);
          border-radius: var(--radius-xl);
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: border-color 0.25s, background 0.25s, transform 0.2s;
          background: var(--bg-surface);
          position: relative;
          overflow: hidden;
        }
        .upload-zone::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(240,168,50,0.04), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .upload-zone:hover { border-color: rgba(240,168,50,0.4); transform: translateY(-1px); }
        .upload-zone:hover::before { opacity: 1; }
        .upload-zone-active {
          border-color: var(--accent) !important;
          background: rgba(240,168,50,0.04) !important;
          transform: translateY(-2px) !important;
        }
        .upload-zone-active::before { opacity: 1 !important; }
        .upload-icon-wrap {
          width: 52px; height: 52px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: var(--accent);
          transition: background 0.2s;
        }
        .upload-spinner {
          width: 22px; height: 22px;
          border: 2px solid rgba(240,168,50,0.2);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .upload-text {
          display: flex; flex-direction: column;
          align-items: center; gap: 0.3rem;
          text-align: center;
        }
        .upload-cta { font-size: 0.95rem; color: var(--text-primary); font-weight: 500; }
        .upload-link { color: var(--accent); }
        .upload-hint { font-size: 0.8rem; color: var(--text-muted); }

        /* Doc list */
        .doc-list { display: flex; flex-direction: column; gap: 0.6rem; }

        /* Empty */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          display: flex; flex-direction: column;
          align-items: center; gap: 0.75rem;
        }
        .empty-icon {
          width: 64px; height: 64px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .empty-title { font-size: 1rem; font-weight: 500; color: var(--text-secondary); }
        .empty-sub   { font-size: 0.85rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}

// ─── Doc Card ─────────────────────────────────────────────────────────────────

function DocCard({
  doc,
  onOpen,
  isDeleting,
  onRequestDelete,
}: {
  doc: Document;
  onOpen: () => void;
  isDeleting: boolean;
  onRequestDelete: () => void;
}) {
  const ext = doc.filename.split(".").pop()?.toUpperCase() ?? "FILE";
  const extColors: Record<string, string> = {
    PDF: "#f05a5a",
    DOCX: "#4f8ef7",
    TXT: "#34c78a",
  };
  const extColor = extColors[ext] ?? "var(--text-muted)";

  return (
    <div
      className={`doc-card ${doc.status === "ready" ? "doc-card-ready" : ""}`}
    >
      {/* File icon */}
      <div className="doc-icon" style={{ borderColor: `${extColor}30` }}>
        <span className="doc-ext" style={{ color: extColor }}>
          {ext}
        </span>
      </div>

      {/* Info */}
      <div
        className="doc-info"
        onClick={onOpen}
        style={{ cursor: doc.status === "ready" ? "pointer" : "default" }}
      >
        <span className="doc-name">{doc.filename}</span>
        <span className="doc-meta">
          {doc.page_count ? `${doc.page_count} pages · ` : ""}
          {new Date(doc.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Status + actions */}
      <div className="doc-right">
        <StatusBadge status={doc.status} />
        {doc.status === "ready" && (
          <button className="doc-open-btn" onClick={onOpen}>
            Chat →
          </button>
        )}
        <button
          className="doc-delete-btn"
          onClick={onRequestDelete} // was onDelete
          disabled={isDeleting}
        >
          {isDeleting ? (
            <div
              style={{
                width: 14,
                height: 14,
                border: "1.5px solid rgba(240,90,90,0.3)",
                borderTopColor: "#f05a5a",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          )}
        </button>
      </div>

      <style>{`
        .doc-card {
          display: flex; align-items: center; gap: 1rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1rem 1.25rem;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          animation: fadeUp 0.3s ease both;
        }
        .doc-card-ready:hover {
          border-color: var(--border);
          background: var(--bg-elevated);
          transform: translateY(-1px);
        }
        .doc-icon {
          width: 44px; height: 44px; flex-shrink: 0;
          background: var(--bg-elevated);
          border: 1px solid;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .doc-ext { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.04em; font-family: 'Syne', sans-serif; }
        .doc-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.2rem; }
        .doc-name { font-size: 0.9rem; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .doc-meta { font-size: 0.75rem; color: var(--text-muted); }
        .doc-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .doc-open-btn {
          background: var(--accent-subtle);
          border: 1px solid rgba(240,168,50,0.2);
          color: var(--accent);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.35rem 0.8rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .doc-open-btn:hover { background: rgba(240,168,50,0.15); box-shadow: 0 0 12px rgba(240,168,50,0.2); }
        .doc-delete-btn {
          background: none; border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 6px;
          transition: color 0.2s, background 0.2s;
          display: flex; align-items: center;
        }
        .doc-delete-btn:hover { color: var(--red); background: rgba(240,90,90,0.08); }
        .doc-delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; color: string; bg: string; dot?: boolean }
  > = {
    processing: {
      label: "Processing",
      color: "var(--accent)",
      bg: "rgba(240,168,50,0.1)",
      dot: true,
    },
    ready: {
      label: "Ready",
      color: "var(--green)",
      bg: "rgba(52,199,138,0.1)",
      dot: false,
    },
    failed: {
      label: "Failed",
      color: "var(--red)",
      bg: "rgba(240,90,90,0.1)",
      dot: false,
    },
  };
  const s = map[status] ?? map.failed;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        background: s.bg,
        color: s.color,
        fontSize: "0.75rem",
        fontWeight: 600,
        padding: "0.3rem 0.7rem",
        borderRadius: "20px",
        whiteSpace: "nowrap",
      }}
    >
      {s.dot && (
        <span
          style={{
            width: 6,
            height: 6,
            background: s.color,
            borderRadius: "50%",
            animation: "pulse-ring 1.5s ease-in-out infinite",
          }}
        />
      )}
      {s.label}
    </div>
  );
}
