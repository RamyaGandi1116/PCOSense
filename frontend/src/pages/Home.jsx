import React from 'react';
import { 
  ClipboardList, 
  Image as ImageIcon, 
  ArrowRight, 
  ShieldCheck, 
  FileCheck2, 
  Activity, 
  AlertCircle,
  BookOpen
} from 'lucide-react';

export default function Home({ setActivePage }) {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-badge">
            <span className="badge badge-primary">Risk Screening Tool</span>
          </div>
          
          <h1 className="hero-title">PCOSense</h1>
          
          <p className="hero-subtitle">
            An ML-powered PCOS risk screening application that combines a trained machine learning model with an interactive web interface.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => setActivePage('screening')}
            >
              <span>Start Risk Screening</span>
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => setActivePage('about')}
            >
              <span>Learn About PCOS</span>
              <BookOpen size={16} />
            </button>
          </div>

          <div className="hero-trust-row">
            <div className="trust-item">
              <ShieldCheck size={16} className="trust-icon" />
              <span>Rotterdam Criteria Aligned</span>
            </div>
            <div className="trust-item">
              <FileCheck2 size={16} className="trust-icon" />
              <span>Strictly Non-Invasive</span>
            </div>
            <div className="trust-item">
              <Activity size={16} className="trust-icon" />
              <span>Regularized ML Pipeline</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>Select Screening Modality</h2>
            <p>Choose between our operational questionnaire screener or explore the upcoming imaging module.</p>
          </div>

          <div className="features-grid">
            {/* Card 1: General Information Screening */}
            <div className="feature-card active-modality">
              <div className="feature-card-header">
                <div className="feature-icon-box">
                  <ClipboardList size={24} />
                </div>
                <span className="badge badge-primary">Available Now</span>
              </div>
              
              <h3>General Information</h3>
              <p className="feature-description">
                Analyze questionnaire-based health and lifestyle information. Evaluates clinical symptoms such as cycle regularity, 
                hirsutism, anthropometrics (BMI), psychological indicators, and 11 dietary consumption patterns.
              </p>

              <div className="feature-meta-list">
                <div className="meta-item">
                  <span className="meta-dot" />
                  <span>30 Pre-screening indicators</span>
                </div>
                <div className="meta-item">
                  <span className="meta-dot" />
                  <span>Immediate statistical risk estimate</span>
                </div>
                <div className="meta-item">
                  <span className="meta-dot" />
                  <span>Model-based probability estimation</span>
                </div>
              </div>

              <div className="feature-card-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActivePage('screening')}
                >
                  <span>Begin Questionnaire</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Card 2: Ultrasound Analysis */}
            <div className="feature-card coming-soon-modality">
              <div className="feature-card-header">
                <div className="feature-icon-box coming-soon-icon">
                  <ImageIcon size={24} />
                </div>
                <span className="badge badge-coming-soon">Coming Soon</span>
              </div>

              <h3>Ultrasound Analysis</h3>
              <p className="feature-description">
                Image-based screening capability — coming soon. Designed to process pelvic transvaginal ultrasound scans 
                to quantify antral follicle counts and ovarian stromal morphology as defined under Rotterdam criteria.
              </p>

              <div className="feature-meta-list">
                <div className="meta-item">
                  <span className="meta-dot" />
                  <span>Computer vision follicle detection</span>
                </div>
                <div className="meta-item">
                  <span className="meta-dot" />
                  <span>Pelvic ovarian morphology analysis</span>
                </div>
                <div className="meta-item">
                  <span className="meta-dot" />
                  <span>Multi-center clinical validation in progress</span>
                </div>
              </div>

              <div className="feature-card-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActivePage('ultrasound')}
                >
                  <span>Explore Preview</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Information Overview Section */}
      <section className="overview-section">
        <div className="container">
          <div className="overview-card">
            <div className="overview-content">
              <h3>Why AI-Assisted Early Screening?</h3>
              <p>
                Polycystic Ovary Syndrome affects up to 13% of women worldwide, yet over 70% remain undiagnosed due to 
                insidious symptom onset and clinical heterogeneity. Typical diagnostic journeys involve multiple physician consultations 
                and delays of two or more years.
              </p>
              <p>
                Our machine learning pipeline uses validated clinical pre-screening questions to provide a prompt, 
                confidential risk estimate—empowering individuals to initiate timely conversations with their healthcare providers.
              </p>
              <div className="overview-action">
                <button 
                  type="button" 
                  className="btn btn-outline-primary"
                  onClick={() => setActivePage('about')}
                >
                  Read Our Clinical Methodology
                </button>
              </div>
            </div>

            <div className="overview-sidebar">
              <div className="info-stat-block">
                <span className="stat-number">8–13%</span>
                <span className="stat-label">Global prevalence among women of reproductive age</span>
              </div>
              <div className="info-stat-block">
                <span className="stat-number">2+ Years</span>
                <span className="stat-label">Average diagnostic delay experienced by patients</span>
              </div>
              <div className="info-stat-block">
                <span className="stat-number">75.0%</span>
                <span className="stat-label">Screening recall achieved on test cohort</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Medical Disclaimer */}
      <section className="home-disclaimer-section">
        <div className="container">
          <div className="disclaimer-banner">
            <AlertCircle size={22} />
            <div>
              <strong>Medical Disclaimer:</strong> This tool is for educational and preliminary screening purposes only. 
              It does not provide a medical diagnosis. Results should not replace consultation with a qualified healthcare professional.
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .home-page {
          padding-bottom: 60px;
        }

        .hero-section {
          padding: 64px 0 54px 0;
          text-align: center;
          background: linear-gradient(180deg, #ffffff 0%, var(--color-bg) 100%);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .hero-container {
          max-width: 780px;
        }

        .hero-badge {
          display: inline-block;
          margin-bottom: 14px;
        }

        .hero-title {
          font-size: 2.75rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 16px;
          letter-spacing: -0.025em;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          line-height: 1.6;
          color: var(--color-text-secondary);
          margin-bottom: 32px;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }

        .btn-lg {
          padding: 0.85rem 1.65rem;
          font-size: 1rem;
        }

        .hero-trust-row {
          display: flex;
          justify-content: center;
          gap: 28px;
          flex-wrap: wrap;
          padding-top: 14px;
          border-top: 1px solid var(--color-border-subtle);
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: var(--color-text-subtle);
          font-weight: 500;
        }

        .trust-icon {
          color: var(--color-primary);
        }

        .features-section {
          padding: 60px 0;
        }

        .section-header {
          margin-bottom: 36px;
        }

        .section-header.text-center {
          text-align: center;
          max-width: 640px;
          margin-left: auto;
          margin-right: auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }

        .feature-card {
          background: #ffffff;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 32px;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }

        .feature-card:hover {
          border-color: var(--color-primary-subtle);
          box-shadow: var(--shadow-md);
        }

        .feature-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .feature-icon-box {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--color-primary-light);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .coming-soon-icon {
          background: #f4f3f0;
          color: #7a7266;
        }

        .feature-card h3 {
          font-size: 1.35rem;
          margin-bottom: 10px;
        }

        .feature-description {
          font-size: 0.94rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 24px;
          flex-grow: 1;
        }

        .feature-meta-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
          padding-top: 16px;
          border-top: 1px solid var(--color-border-subtle);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }

        .meta-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-primary);
        }

        .coming-soon-modality .meta-dot {
          background: #999388;
        }

        .feature-card-footer {
          margin-top: auto;
        }

        .feature-card-footer .btn {
          width: 100%;
        }

        .overview-section {
          padding: 20px 0 50px 0;
        }

        .overview-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 36px;
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
        }

        .overview-content h3 {
          font-size: 1.35rem;
          margin-bottom: 14px;
        }

        .overview-content p {
          font-size: 0.94rem;
          line-height: 1.6;
        }

        .overview-action {
          margin-top: 20px;
        }

        .overview-sidebar {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 18px;
          background: var(--color-surface-subtle);
          border-radius: var(--radius-md);
          padding: 24px;
          border: 1px solid var(--color-border-subtle);
        }

        .info-stat-block {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 1.85rem;
          font-weight: 700;
          color: var(--color-primary);
          line-height: 1.1;
        }

        .stat-label {
          font-size: 0.82rem;
          color: var(--color-text-secondary);
          margin-top: 4px;
        }

        .home-disclaimer-section {
          padding-top: 10px;
        }

        @media (max-width: 840px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          .overview-card {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 2.15rem;
          }
        }
      `}</style>
    </div>
  );
}
