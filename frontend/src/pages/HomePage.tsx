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
