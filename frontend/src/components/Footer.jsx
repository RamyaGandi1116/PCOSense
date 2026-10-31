import React from 'react';
import { Activity, ShieldCheck, HeartHandshake, AlertCircle } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="site-footer">
      <div className="container">
        {/* Top Disclaimer Box */}
        <div className="footer-disclaimer-box">
          <div className="disclaimer-icon">
            <AlertCircle size={20} />
          </div>
          <div className="disclaimer-content">
            <h4>Important Medical & Clinical Disclaimer</h4>
            <p>
              PCOSense is an AI-assisted statistical estimation instrument intended strictly for 
              educational, self-awareness, and preliminary risk stratification purposes. It <strong>does not provide a medical diagnosis</strong>, 
              confirm clinical status, or replace clinical consultation with a board-certified gynecologist, reproductive endocrinologist, 
              or primary care physician. Diagnostic confirmation requires clinical evaluation, physical assessment, pelvic ultrasound examination, 
              and comprehensive serum biochemical hormone testing.
            </p>
          </div>
        </div>

        {/* Footer Main Content */}
        <div className="footer-main-grid">
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <Activity size={18} />
              </div>
              <span className="footer-brand-title">PCOSense</span>
            </div>
            <p className="footer-desc">
              Evidence-based pre-screening analytics utilizing a regularized machine learning pipeline 
              trained and validated on clinical survey cohorts.
            </p>
            <div className="footer-badges">
              <span className="badge">
                <ShieldCheck size={14} style={{ color: 'var(--color-primary)' }} />
                <span>Zero Tracking</span>
              </span>
              <span className="badge">
                <HeartHandshake size={14} style={{ color: 'var(--color-primary)' }} />
                <span>Non-Invasive</span>
              </span>
            </div>
          </div>

          <div className="footer-col">
            <h5>Navigation</h5>
            <ul className="footer-links">
              <li>
                <button type="button" onClick={() => setActivePage('home')}>Home</button>
              </li>
              <li>
                <button type="button" onClick={() => setActivePage('screening')}>General Information Screening</button>
              </li>
              <li>
                <button type="button" onClick={() => setActivePage('ultrasound')}>Ultrasound Analysis (Preview)</button>
              </li>
              <li>
                <button type="button" onClick={() => setActivePage('about')}>About & Methodology</button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Clinical Guidelines</h5>
            <ul className="footer-links">
              <li><span className="text-muted">Rotterdam Consensus (2003)</span></li>
              <li><span className="text-muted">International PCOS Guidelines (2023)</span></li>
              <li><span className="text-muted">Androgen Excess & PCOS Society</span></li>
              <li><span className="text-muted">WHO Reproductive Health Facts</span></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Model Specifications</h5>
            <div className="model-spec-card">
              <div className="spec-row">
                <span className="spec-label">Architecture</span>
                <span className="spec-val">Regularized Random Forest</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Validation</span>
                <span className="spec-val">Stratified 5-Fold CV</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Test ROC-AUC</span>
                <span className="spec-val">0.8472</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Sensitivity</span>
                <span className="spec-val">75.0% (6/8 detected)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} PCOSense. Educational & Portfolio Project.</p>
          <p className="footer-tech-note">FastAPI Backend + React Frontend + Scikit-learn Pipeline</p>
        </div>
      </div>

      <style>{`
        .site-footer {
          margin-top: auto;
          background: #ffffff;
          border-top: 1px solid var(--color-border);
          padding: 48px 0 28px 0;
        }

        .footer-disclaimer-box {
          background: #fbf9f5;
          border: 1px solid #ebd9c2;
          border-radius: var(--radius-md);
          padding: 18px 22px;
          display: flex;
          gap: 16px;
          margin-bottom: 40px;
        }

        .disclaimer-icon {
          color: #92531d;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .disclaimer-content h4 {
          font-size: 0.92rem;
          font-weight: 600;
          color: #723b0d;
          margin-bottom: 6px;
        }

        .disclaimer-content p {
          font-size: 0.85rem;
          color: #6d5d4b;
          line-height: 1.5;
          margin-bottom: 0;
        }

        .footer-main-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
          gap: 36px;
          padding-bottom: 36px;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .footer-col h5 {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-subtle);
          margin-bottom: 16px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .footer-brand-icon {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: var(--color-primary-light);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-brand-title {
          font-size: 0.98rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .footer-desc {
          font-size: 0.86rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .footer-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-links button {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.88rem;
          color: var(--color-text-secondary);
          cursor: pointer;
          text-align: left;
          transition: color 0.15s ease;
        }

        .footer-links button:hover {
          color: var(--color-primary);
          text-decoration: underline;
        }

        .text-muted {
          font-size: 0.88rem;
          color: var(--color-text-subtle);
        }

        .model-spec-card {
          background: var(--color-surface-subtle);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .spec-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .spec-label {
          color: var(--color-text-subtle);
        }

        .spec-val {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .footer-bottom-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          font-size: 0.82rem;
          color: var(--color-text-subtle);
        }

        .footer-tech-note {
          font-family: var(--font-mono);
          font-size: 0.76rem;
        }

        @media (max-width: 900px) {
          .footer-main-grid {
            grid-template-columns: 1fr 1fr;
            gap: 28px;
          }
        }

        @media (max-width: 600px) {
          .footer-main-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom-bar {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
