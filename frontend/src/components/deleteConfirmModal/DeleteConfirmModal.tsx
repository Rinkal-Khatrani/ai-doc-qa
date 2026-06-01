import { useEffect } from "react";
import type { Document } from "../../types";

export function DeleteConfirmModal({
  doc,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  doc: Document;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal-box animate-fade-up">
        {/* Warning icon */}
        <div className="modal-icon">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="modal-title font-display">Delete document?</h2>

        {/* Doc name pill */}
        <div className="modal-doc-name">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          {doc.filename}
        </div>

        {/* Warning list */}
        <p className="modal-subtitle">
          This action is irreversible. The following will be permanently
          deleted:
        </p>
        <ul className="modal-consequences">
          <li>
            <span className="consequence-dot" />
            The original document file
          </li>
          <li>
            <span className="consequence-dot" />
            All embedded chunks and vector data
          </li>
          <li>
            <span className="consequence-dot" />
            Your entire chat history with this document
          </li>
        </ul>

        {/* Actions */}
        <div className="modal-actions">
          <button
            className="modal-btn-cancel"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="modal-btn-delete"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="modal-spinner" />
                Deleting…
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                Delete permanently
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.15s ease;
        }
        .modal-box {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 2rem;
          width: 100%; max-width: 420px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset;
        }
        .modal-icon {
          width: 48px; height: 48px;
          background: rgba(240,90,90,0.1);
          border: 1px solid rgba(240,90,90,0.25);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: var(--red);
          margin-bottom: 1.25rem;
        }
        .modal-title {
          font-size: 1.25rem; font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }
        .modal-doc-name {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.4rem 0.75rem;
          font-size: 0.82rem; font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
          max-width: 100%; overflow: hidden;
          white-space: nowrap; text-overflow: ellipsis;
        }
        .modal-subtitle {
          font-size: 0.85rem; color: var(--text-secondary);
          line-height: 1.6; margin-bottom: 0.9rem;
        }
        .modal-consequences {
          list-style: none;
          background: rgba(240,90,90,0.05);
          border: 1px solid rgba(240,90,90,0.15);
          border-radius: var(--radius);
          padding: 0.85rem 1rem;
          margin-bottom: 1.75rem;
          display: flex; flex-direction: column; gap: 0.55rem;
        }
        .modal-consequences li {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.83rem; color: #f09090;
          line-height: 1.5;
        }
        .consequence-dot {
          width: 5px; height: 5px; flex-shrink: 0;
          background: var(--red); border-radius: 50%;
          opacity: 0.7;
        }
        .modal-actions {
          display: flex; gap: 0.75rem;
        }
        .modal-btn-cancel {
          flex: 1;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 500;
          padding: 0.75rem;
          border-radius: var(--radius); cursor: pointer;
          transition: all 0.2s;
        }
        .modal-btn-cancel:hover:not(:disabled) {
          color: var(--text-primary); border-color: var(--border);
          background: var(--bg-overlay);
        }
        .modal-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
        .modal-btn-delete {
          flex: 1;
          background: var(--red);
          border: none;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600;
          padding: 0.75rem;
          border-radius: var(--radius); cursor: pointer;
          transition: all 0.2s;
          display: flex; align-items: center;
          justify-content: center; gap: 0.5rem;
          box-shadow: 0 4px 16px rgba(240,90,90,0.3);
        }
        .modal-btn-delete:hover:not(:disabled) {
          background: #e04040;
          box-shadow: 0 6px 22px rgba(240,90,90,0.45);
          transform: translateY(-1px);
        }
        .modal-btn-delete:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .modal-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
      `}</style>
    </div>
  );
}
