import { Link } from "react-router-dom";

interface AuthShellProps {
  title: string;
  subtitle: string;
  linkText: string;
  linkLabel: string;
  linkTo: string;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  submitLabel: string;
}

export function AuthShell({
  title,
  subtitle,
  linkText,
  linkLabel,
  linkTo,
  error,
  loading,
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
  submitLabel,
}: AuthShellProps) {
  return (
    <div className="auth-page">
      {/* Background blobs */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-card animate-fade-up">
        {/* Logo mark */}
        <div className="auth-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect
              width="32"
              height="32"
              rx="10"
              fill="var(--accent)"
              fillOpacity="0.15"
            />
            <path
              d="M8 10h10M8 15h16M8 20h12"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="24" cy="10" r="3" fill="var(--accent)" />
          </svg>
        </div>

        <h1 className="auth-title font-display">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>

        {error && (
          <div className="auth-error animate-fade-in">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
              required
            />
          </div>
          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary btn-glow"
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : submitLabel}
          </button>
        </form>

        <p className="auth-link">
          {linkText} <Link to={linkTo}>{linkLabel} →</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          background: var(--bg-base);
        }
        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .auth-blob-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(240,168,50,0.12), transparent 70%);
          top: -100px; right: -100px;
        }
        .auth-blob-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(79,142,247,0.08), transparent 70%);
          bottom: -80px; left: -80px;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          position: relative;
          z-index: 1;
          box-shadow: 0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset;
        }
        .auth-logo {
          margin-bottom: 1.5rem;
        }
        .auth-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 0.4rem;
        }
        .auth-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1.75rem;
        }
        .auth-error {
          background: rgba(240,90,90,0.1);
          border: 1px solid rgba(240,90,90,0.25);
          color: #f08080;
          font-size: 0.85rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius);
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .auth-form { display: flex; flex-direction: column; gap: 1.1rem; }
        .field-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .field-label { font-size: 0.8rem; font-weight: 500; color: var(--text-secondary); letter-spacing: 0.04em; text-transform: uppercase; }
        .field-input {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          padding: 0.75rem 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          width: 100%;
        }
        .field-input::placeholder { color: var(--text-muted); }
        .field-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .btn-primary {
          background: var(--accent);
          color: #0d0f14;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.8rem;
          border-radius: var(--radius);
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          margin-top: 0.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 20px rgba(240,168,50,0.3);
        }
        .btn-primary:hover:not(:disabled) {
          background: #f5b84a;
          box-shadow: 0 6px 28px rgba(240,168,50,0.45);
          transform: translateY(-1px);
        }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #0d0f14;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        .auth-link {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 1.5rem;
        }
        .auth-link a {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .auth-link a:hover { opacity: 0.8; }
      `}</style>
    </div>
  );
}
