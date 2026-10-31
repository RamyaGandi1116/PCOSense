import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function RiskGauge({ percentage, level, prediction }) {
  const isHighRisk = level === 'Higher Risk' || prediction === 'Yes' || percentage >= 50;
  const clampedPercent = Math.min(Math.max(percentage, 0), 100);

  // Muted clinical colors
  const primaryColor = isHighRisk ? 'var(--color-risk-high)' : 'var(--color-risk-low)';
  const bgColor = isHighRisk ? 'var(--color-risk-high-bg)' : 'var(--color-risk-low-bg)';
  const borderColor = isHighRisk ? 'var(--color-risk-high-border)' : 'var(--color-risk-low-border)';

  return (
    <div className="risk-gauge-card" style={{ borderColor, backgroundColor: bgColor }}>
      <div className="risk-header-row">
        <span className="risk-eyebrow">Statistical Risk Assessment</span>
        <div className={`risk-status-pill ${isHighRisk ? 'high' : 'low'}`}>
          {isHighRisk ? <AlertCircle size={15} /> : <ShieldCheck size={15} />}
          <span>{level}</span>
        </div>
      </div>

      <div className="risk-metric-display">
        <div className="risk-big-number" style={{ color: primaryColor }}>
          {percentage}%
        </div>
        <div className="risk-meta">
          <span className="risk-meta-title">Estimated PCOS Probability</span>
          <span className="risk-meta-sub">Based on questionnaire symptom & lifestyle patterns</span>
        </div>
      </div>

      {/* Visual Indicator Bar */}
      <div className="gauge-track-wrapper">
        <div 
          className="gauge-track" 
          role="progressbar" 
          aria-valuenow={clampedPercent} 
          aria-valuemin={0} 
          aria-valuemax={100}
        >
          <div 
            className="gauge-fill" 
            style={{ 
              width: `${clampedPercent}%`, 
              backgroundColor: primaryColor 
            }} 
          />
          {/* Threshold marker at 50% */}
          <div className="threshold-marker" style={{ left: '50%' }} title="50% Classification Threshold" />
        </div>

        <div className="gauge-labels">
          <span className="label-low">0% (Baseline)</span>
          <span className="label-mid">50% Model Threshold</span>
          <span className="label-high">100% Risk</span>
        </div>
      </div>

      <div className="risk-disclaimer-note">
        This percentage is a statistical model output indicating phenotypic similarity to diagnosed individuals in our research cohort. It is <strong>not a clinical diagnosis</strong>.
      </div>

      <style>{`
        .risk-gauge-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 28px;
          transition: all 0.2s ease;
        }

        .risk-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .risk-eyebrow {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-subtle);
        }

        .risk-status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .risk-status-pill.low {
          background: #ffffff;
          border: 1px solid var(--color-risk-low-border);
          color: var(--color-risk-low);
        }

        .risk-status-pill.high {
          background: #ffffff;
          border: 1px solid var(--color-risk-high-border);
          color: var(--color-risk-high);
        }

        .risk-metric-display {
          display: flex;
          align-items: baseline;
          gap: 16px;
          margin-bottom: 20px;
        }

        .risk-big-number {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
        }

        .risk-meta {
          display: flex;
          flex-direction: column;
        }

        .risk-meta-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .risk-meta-sub {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }

        .gauge-track-wrapper {
          margin-bottom: 16px;
        }

        .gauge-track {
          position: relative;
          width: 100%;
          height: 10px;
          background: #e2e8e5;
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .gauge-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .threshold-marker {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #ffffff;
          box-shadow: 0 0 2px rgba(0,0,0,0.4);
        }

        .gauge-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--color-text-subtle);
          margin-top: 6px;
        }

        .label-mid {
          font-weight: 500;
        }

        .risk-disclaimer-note {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          line-height: 1.45;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          padding-top: 12px;
        }

        @media (max-width: 600px) {
          .risk-metric-display {
            flex-direction: column;
            gap: 6px;
          }
          .risk-big-number {
            font-size: 2.75rem;
          }
        }
      `}</style>
    </div>
  );
}
