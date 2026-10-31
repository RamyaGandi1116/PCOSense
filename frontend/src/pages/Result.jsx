import React from 'react';
import RiskGauge from '../components/RiskGauge';
import { 
  ArrowLeft, 
  Printer, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

export default function Result({ resultData, onReset, setActivePage }) {
  if (!resultData) {
    return (
      <div className="container-narrow result-empty-state">
        <div className="card text-center" style={{ padding: '48px 24px' }}>
          <AlertCircle size={36} style={{ color: 'var(--color-primary)', margin: '0 auto 16px auto' }} />
          <h3>No Active Screening Result</h3>
          <p>Please complete the general information questionnaire to generate your statistical risk screening estimate.</p>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setActivePage('screening')}
          >
            Start Screening Questionnaire
          </button>
        </div>
      </div>
    );
  }

  const {
    prediction,
    risk_percentage,
    risk_level,
    contributing_factors = [],
    recommendations = [],
    disclaimer
  } = resultData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="result-page container-narrow">
      {/* Top Header */}
      <div className="result-header-bar no-print">
        <button
          type="button"
          className="btn-back"
          onClick={onReset}
        >
          <ArrowLeft size={16} />
          <span>Start New Screening</span>
        </button>

        <div className="result-top-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrint}
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      <div className="result-title-section">
        <span className="badge badge-primary">AI-Assisted Assessment</span>
        <h2>Your Screening Result</h2>
        <p className="lead">
          The machine learning pipeline has analyzed your questionnaire inputs against historical clinical cohort patterns.
        </p>
      </div>

      {/* Main Visual Risk Gauge */}
      <RiskGauge 
        percentage={risk_percentage}
        level={risk_level}
        prediction={prediction}
      />

      {/* Clinical Interpretation Card */}
      <div className="card interpretation-card">
        <div className="interp-header">
          <Stethoscope size={20} className="interp-icon" />
          <h3>What This Result Means</h3>
        </div>

        <p className="interp-body">
          {risk_level === 'Higher Risk' ? (
            <>
              Your responses demonstrate a constellation of indicators—such as menstrual cycle irregularities, 
              phenotypic signs of androgen excess, and biometric parameters—that statistically align with individuals 
              diagnosed with PCOS in our clinical reference cohort. This suggests an <strong>elevated screening likelihood</strong> that 
              warrants clinical attention.
            </>
          ) : (
            <>
              Your submitted indicators currently show a lower statistical affinity with classical PCOS symptom profiles in our 
              cohort. While this is encouraging, <strong>a lower screening estimate does not rule out PCOS</strong>, particularly 
              lean or milder phenotypic expressions of the condition.
            </>
          )}
        </p>

        <div className="recommendations-box">
          <h4>Recommended Next Steps</h4>
          <ul className="rec-list">
            {recommendations.map((rec, i) => (
              <li key={i} className="rec-item">
                <CheckCircle2 size={16} className="rec-icon" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Factors Evaluated by the Model */}
      <div className="card factors-card">
        <div className="factors-header">
          <div className="factors-title-group">
            <h3>Relevant Reported Indicators</h3>
            <p>Self-reported clinical indicators that provide context for your screening profile.</p>
          </div>
          <span className="badge badge-primary">Reported Indicators</span>
        </div>

        <div className="factors-table-wrapper">
          <table className="factors-table">
            <thead>
              <tr>
                <th>Reported Indicator</th>
                <th>Your Input</th>
                <th>Clinical & Screening Context</th>
              </tr>
            </thead>
            <tbody>
              {contributing_factors.map((f, i) => (
                <tr key={i}>
                  <td className="factor-name-cell">
                    <strong>{f.factor}</strong>
                  </td>
                  <td>
                    <span className="factor-status-pill">{f.status}</span>
                  </td>
                  <td className="factor-desc-cell">
                    <span className="factor-impact-tag">{f.impact}</span>
                    <span className="factor-desc-text">{f.description}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="factors-caveat-box">
          <Info size={16} />
          <div>
            <strong>Clinical Context Notice:</strong> The indicators listed above reflect relevant self-reported items
            evaluated against established clinical consensus literature (e.g., Rotterdam diagnostic guidelines).
            They are presented to provide clinical context for your responses and should not be interpreted as
            individual algorithmic feature importance values from the Random Forest model.
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="disclaimer-banner result-disclaimer-box">
        <AlertCircle size={20} />
        <div>
          <strong>Medical Notice:</strong> {disclaimer}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="result-footer-actions no-print">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onReset}
        >
          <RotateCcw size={16} />
          <span>Retake Screening</span>
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActivePage('about')}
        >
          <span>Learn About PCOS Criteria</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <style>{`
        .result-page {
          padding: 40px 0 60px 0;
        }

        .result-empty-state {
          padding: 60px 0;
        }

        .result-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .btn-back {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          padding: 6px 0;
        }

        .btn-back:hover {
          color: var(--color-primary);
        }

        .result-title-section {
          margin-bottom: 24px;
        }

        .result-title-section h2 {
          font-size: 2rem;
          margin-top: 8px;
          margin-bottom: 8px;
        }

        .interpretation-card {
          margin-bottom: 24px;
        }

        .interp-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .interp-icon {
          color: var(--color-primary);
        }

        .interp-header h3 {
          font-size: 1.25rem;
          margin-bottom: 0;
        }

        .interp-body {
          font-size: 0.96rem;
          line-height: 1.6;
          color: var(--color-text-secondary);
          margin-bottom: 20px;
        }

        .recommendations-box {
          background: var(--color-surface-subtle);
          border-radius: var(--radius-md);
          padding: 18px 20px;
          border: 1px solid var(--color-border-subtle);
        }

        .recommendations-box h4 {
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-text-primary);
          margin-bottom: 12px;
        }

        .rec-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rec-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.45;
        }

        .rec-icon {
          color: var(--color-primary);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .factors-card {
          margin-bottom: 24px;
        }

        .factors-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .factors-title-group h3 {
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .factors-title-group p {
          font-size: 0.88rem;
          margin-bottom: 0;
        }

        .factors-table-wrapper {
          overflow-x: auto;
          margin-bottom: 16px;
        }

        .factors-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          text-align: left;
        }

        .factors-table th {
          background: var(--color-surface-subtle);
          color: var(--color-text-subtle);
          font-weight: 600;
          padding: 10px 14px;
          border-bottom: 1px solid var(--color-border);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .factors-table td {
          padding: 14px;
          border-bottom: 1px solid var(--color-border-subtle);
          vertical-align: top;
        }

        .factor-name-cell {
          color: var(--color-text-primary);
          min-width: 160px;
        }

        .factor-status-pill {
          display: inline-block;
          background: var(--color-surface-subtle);
          border: 1px solid var(--color-border);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .factor-desc-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .factor-impact-tag {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--color-primary);
        }

        .factor-desc-text {
          font-size: 0.84rem;
          color: var(--color-text-secondary);
          line-height: 1.4;
        }

        .factors-caveat-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #f7f9f8;
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          font-size: 0.82rem;
          color: var(--color-text-secondary);
          line-height: 1.45;
        }

        .factors-caveat-box svg {
          color: var(--color-primary);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .result-disclaimer-box {
          margin-bottom: 28px;
        }

        .result-footer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
          }
          .card {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
        }
      `}</style>
    </div>
  );
}
