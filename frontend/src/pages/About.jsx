import React from 'react';
import { 
  ShieldAlert, 
  BookOpen, 
  Activity, 
  AlertCircle, 
  Database,
  ArrowRight
} from 'lucide-react';

export default function About({ setActivePage }) {
  return (
    <div className="about-page container-narrow">
      <div className="about-header text-center">
        <span className="badge badge-primary">Methodology & Background</span>
        <h2>About PCOSense</h2>
        <p className="lead">
          An overview of Polycystic Ovary Syndrome, our machine learning pipeline, 
          and the design principles governing this pre-screening application.
        </p>
      </div>

      {/* Section 1: What is PCOS */}
      <section className="about-section card">
        <div className="section-title-row">
          <BookOpen size={20} className="section-icon" />
          <h3>Understanding Polycystic Ovary Syndrome</h3>
        </div>
        
        <p>
          <strong>Polycystic Ovary Syndrome (PCOS)</strong> is a complex, multifaceted endocrine and metabolic condition 
          affecting an estimated <strong>8% to 13% of women of reproductive age globally</strong>. It is the leading cause of 
          anovulatory subfertility and is strongly associated with lifelong metabolic and psychological morbidities.
        </p>

        <p>
          Clinical diagnosis is based on the internationally recognized <strong>Rotterdam Consensus Criteria (2003)</strong>, 
          which requires the presence of at least two of the following three features (with exclusion of other etiologies):
        </p>

        <div className="rotterdam-grid">
          <div className="rotterdam-card">
            <span className="rotterdam-num">1</span>
            <h4>Ovulatory Dysfunction</h4>
            <p>Oligo-ovulation or anovulation presenting as irregular, infrequent (cycles &gt; 35 days), or absent menstrual periods.</p>
          </div>

          <div className="rotterdam-card">
            <span className="rotterdam-num">2</span>
            <h4>Hyperandrogenism</h4>
            <p>Clinical signs (hirsutism, severe adult acne, androgenic alopecia) or biochemical excess (elevated testosterone or DHEA-S).</p>
          </div>

          <div className="rotterdam-card">
            <span className="rotterdam-num">3</span>
            <h4>Polycystic Ovarian Morphology</h4>
            <p>Detection of 20+ small antral follicles per ovary or an enlarged ovarian volume (&ge; 10 mL) via pelvic ultrasound.</p>
          </div>
        </div>
      </section>

      {/* Section 2: Machine Learning Methodology */}
      <section className="about-section card">
        <div className="section-title-row">
          <Activity size={20} className="section-icon" />
          <h3>Machine Learning Architecture & Leakage Prevention</h3>
        </div>

        <p>
          A common pitfall in healthcare machine learning is <strong>target leakage</strong>—the inclusion of variables that are 
          only known <em>after</em> a clinical diagnosis has been made. To ensure our tool functions as a genuine pre-diagnostic 
          screening instrument, our pipeline underwent a rigorous feature audit:
        </p>

        <div className="leakage-table-wrapper">
          <table className="leakage-table">
            <thead>
              <tr>
                <th>Excluded Feature</th>
                <th>Reason for Exclusion (Leakage Analysis)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>PCOS_Medication</code></td>
                <td>Post-diagnosis intervention. A user only takes PCOS-specific medication after receiving a clinical diagnosis.</td>
              </tr>
              <tr>
                <td><code>Hyperandrogenism</code></td>
                <td>Biochemical lab test criterion. Lay users at home only observe outward signs (captured by <code>Hirsutism</code>).</td>
              </tr>
              <tr>
                <td><code>Insulin_Resistance</code></td>
                <td>Formal biochemical assay (HOMA-IR/fasting insulin) unavailable during pre-screening.</td>
              </tr>
              <tr>
                <td><code>Hormonal_Imbalance</code></td>
                <td>Endocrinological diagnosis that acts as a direct proxy for the target variable itself.</td>
              </tr>
              <tr>
                <td><code>Conception_Difficulty</code></td>
                <td>Cohort selection bias: &gt;90% of respondents were unmarried young women who had never attempted conception.</td>
              </tr>
              <tr>
                <td><code>Exercise_Benefit</code></td>
                <td>Retrospective evaluation of condition symptom management.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>Engineered & Retained Features</h4>
        <p>
          The final predictive feature set includes <strong>30 pre-screening indicators</strong>: self-reported cycle irregularity, 
          hirsutism, psychological markers, 11 nutritional intake frequencies, lifestyle routines, and 
          <strong>Body Mass Index (BMI)</strong> computed from objective height and weight measurements.
        </p>

        <h4>Pipeline & Model Training Specifications</h4>
        <ul className="spec-bullet-list">
          <li><strong>Preprocessing:</strong> Encapsulated inside a Scikit-learn <code>ColumnTransformer</code> utilizing <code>StandardScaler</code> for numerical variables and <code>OneHotEncoder(handle_unknown='ignore')</code> for categoricals.</li>
          <li><strong>Classifier:</strong> Regularized <code>RandomForestClassifier(max_depth=3, n_estimators=50, class_weight='balanced')</code> to combat overfitting on small-sample medical data.</li>
          <li><strong>Validation Strategy:</strong> Stratified 5-Fold Cross-Validation on the training partition ($N=137$), with a strictly untouched held-out test benchmark ($N=35$).</li>
        </ul>
      </section>

      {/* Section 3: Validation Metrics */}
      <section className="about-section card">
        <div className="section-title-row">
          <Database size={20} className="section-icon" />
          <h3>Benchmarked Test Set Performance</h3>
        </div>

        <p>
          In healthcare screening, missing a positive case (False Negative) is clinically far more costly than referring a healthy 
          individual for follow-up (False Positive). Therefore, our model optimization strictly prioritized 
          <strong>positive-class Recall (Sensitivity)</strong> and <strong>ROC-AUC</strong>:
        </p>

        <div className="metrics-summary-grid">
          <div className="metric-box">
            <span className="metric-box-val">75.0%</span>
            <span className="metric-box-lbl">Sensitivity / Recall</span>
            <span className="metric-box-sub">Detected 6 of 8 positive cases on unseen test data</span>
          </div>

          <div className="metric-box">
            <span className="metric-box-val">0.8472</span>
            <span className="metric-box-lbl">ROC-AUC Score</span>
            <span className="metric-box-sub">Strong threshold discrimination power</span>
          </div>

          <div className="metric-box">
            <span className="metric-box-val">77.1%</span>
            <span className="metric-box-lbl">Test Accuracy</span>
            <span className="metric-box-sub">Balanced performance across both classes</span>
          </div>

          <div className="metric-box">
            <span className="metric-box-val">0.600</span>
            <span className="metric-box-lbl">F1-Score</span>
            <span className="metric-box-sub">Harmonic mean on the positive class</span>
          </div>
        </div>
      </section>

      {/* Section 4: Critical Limitations */}
      <section className="about-section card">
        <div className="section-title-row">
          <ShieldAlert size={20} className="section-icon" style={{ color: 'var(--color-risk-high)' }} />
          <h3>Critical Study Limitations</h3>
        </div>

        <ul className="limitations-list">
          <li>
            <strong>Compact Sample Size:</strong> The current model is trained on 172 validated survey records. While cross-validation demonstrates good stability, statistical variance remains present. Larger multi-center clinical cohorts are required for broad clinical generalizability.
          </li>
          <li>
            <strong>Subjective Recall Bias:</strong> Nutritional frequencies and symptom severity are self-reported, which introduces subjective variation between respondents.
          </li>
          <li>
            <strong>Absence of Confirmatory Labs:</strong> The current release relies solely on questionnaire features and does not incorporate transvaginal ultrasound morphology or serum hormone profiles (LH, FSH, testosterone, AMH).
          </li>
          <li>
            <strong>Not a Diagnostic Medical Device:</strong> This system has not received regulatory clearance (such as FDA or CE-MDR) and must not be used as an independent diagnostic authority.
          </li>
        </ul>
      </section>

      {/* Mandatory Disclaimer */}
      <div className="disclaimer-banner about-disclaimer-box">
        <AlertCircle size={22} />
        <div>
          <strong>Medical Notice:</strong> Results generated by this website are for educational risk screening only. 
          Please consult a board-certified gynecologist or endocrinologist for clinical diagnosis, transvaginal pelvic ultrasound, 
          and diagnostic laboratory testing.
        </div>
      </div>

      <div className="about-bottom-cta text-center">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => setActivePage('screening')}
        >
          <span>Take the Screening Questionnaire</span>
          <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        .about-page {
          padding: 40px 0 60px 0;
        }

        .about-header {
          margin-bottom: 36px;
        }

        .about-header h2 {
          font-size: 2rem;
          margin-top: 8px;
          margin-bottom: 8px;
        }

        .about-section {
          margin-bottom: 28px;
          padding: 32px;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .section-icon {
          color: var(--color-primary);
        }

        .section-title-row h3 {
          font-size: 1.3rem;
          margin-bottom: 0;
        }

        .rotterdam-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          margin-top: 20px;
        }

        .rotterdam-card {
          background: var(--color-surface-subtle);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
        }

        .rotterdam-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--color-primary);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }

        .rotterdam-card h4 {
          font-size: 0.98rem;
          margin-bottom: 6px;
        }

        .rotterdam-card p {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          margin-bottom: 0;
          line-height: 1.45;
        }

        .leakage-table-wrapper {
          overflow-x: auto;
          margin: 18px 0;
        }

        .leakage-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }

        .leakage-table th {
          background: var(--color-surface-subtle);
          padding: 10px 14px;
          text-align: left;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-text-subtle);
          text-transform: uppercase;
          border-bottom: 1px solid var(--color-border);
        }

        .leakage-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--color-border-subtle);
          vertical-align: top;
        }

        .leakage-table code {
          font-family: var(--font-mono);
          background: var(--color-surface-subtle);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          color: var(--color-risk-high);
        }

        .spec-bullet-list {
          padding-left: 20px;
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }

        .metrics-summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 16px;
          margin-top: 16px;
        }

        .metric-box {
          background: var(--color-surface-subtle);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 18px 14px;
          display: flex;
          flex-direction: column;
          text-align: center;
        }

        .metric-box-val {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--color-primary);
          line-height: 1.1;
        }

        .metric-box-lbl {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-top: 4px;
        }

        .metric-box-sub {
          font-size: 0.74rem;
          color: var(--color-text-subtle);
          margin-top: 6px;
          line-height: 1.35;
        }

        .limitations-list {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 0.92rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        .about-disclaimer-box {
          margin-bottom: 36px;
        }

        .about-bottom-cta {
          padding-top: 10px;
        }

        @media (max-width: 768px) {
          .rotterdam-grid {
            grid-template-columns: 1fr;
          }
          .metrics-summary-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
