import "./Login.css";

/**
 * Shared split-screen shell for Login / Register.
 * Left panel: brand + a small "live ledger" reminder of the product.
 * Right panel: the actual form, passed in as children.
 */
export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="auth-shell">
      {/* Left brand panel — hidden on small screens */}
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <div className="auth-logo-mark ms-mono">Ms</div>
          <span className="auth-logo-text ms-display">MediStock</span>
        </div>

        <div className="auth-brand-mid">
          <p className="auth-brand-eyebrow ms-mono">{eyebrow}</p>
          <h1 className="auth-brand-title ms-display">{title}</h1>
          <p className="auth-brand-sub">{subtitle}</p>
        </div>

        <div className="auth-brand-ledger">
          <div className="auth-brand-ledger-row">
            <span className="auth-brand-ledger-name">Insulin Glargine</span>
            <span className="auth-pill auth-pill-low">
              <span className="auth-pill-dot" /> Low stock
            </span>
          </div>
          <div className="auth-brand-ledger-row">
            <span className="auth-brand-ledger-name">Amoxicillin 500mg</span>
            <span className="auth-pill auth-pill-ok">In stock</span>
          </div>
          <div className="auth-brand-ledger-row">
            <span className="auth-brand-ledger-meta">BAT-22750 · exp 08/2026</span>
            <span className="auth-pill auth-pill-low">Expiring soon</span>
          </div>
        </div>

        <p className="auth-brand-foot">© {new Date().getFullYear()} MediStock — inventory for pharmacies, hospitals & clinics.</p>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-mobile-logo">
            <div className="auth-form-mobile-mark ms-mono">Rx</div>
            <span className="ms-display" style={{ fontWeight: 600, fontSize: "1.05rem" }}>MediStock</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
