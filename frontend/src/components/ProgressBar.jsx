import React from 'react';
import { Check } from 'lucide-react';

export default function ProgressBar({ steps, currentStep, onStepClick }) {
  const progressPercent = ((currentStep) / (steps.length - 1)) * 100;

  return (
    <div className="stepper-wrapper" aria-label="Questionnaire Progress">
      {/* Header Info */}
      <div className="stepper-header">
        <div className="stepper-title-group">
          <span className="stepper-step-count">
            Step {currentStep + 1} of {steps.length}
          </span>
          <h3 className="stepper-current-label">{steps[currentStep].title}</h3>
        </div>
        <span className="stepper-percent">{Math.round(progressPercent)}% Completed</span>
      </div>

      {/* Progress Bar Track */}
      <div className="stepper-track" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100}>
        <div 
          className="stepper-bar-fill" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Pills for Fast Navigation */}
      <div className="stepper-pills">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <button
              key={step.id}
              type="button"
              className={`step-pill ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onStepClick && isCompleted && onStepClick(index)}
              disabled={!isCompleted && !isCurrent}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="pill-number">
                {isCompleted ? <Check size={12} strokeWidth={3} /> : index + 1}
              </span>
              <span className="pill-title">{step.shortTitle || step.title}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .stepper-wrapper {
          margin-bottom: var(--space-6);
        }

        .stepper-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 12px;
        }

        .stepper-step-count {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-primary);
        }

        .stepper-current-label {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-top: 2px;
          margin-bottom: 0;
        }

        .stepper-percent {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-text-subtle);
          font-variant-numeric: tabular-nums;
        }

        .stepper-track {
          width: 100%;
          height: 6px;
          background: var(--color-border-subtle);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 16px;
        }

        .stepper-bar-fill {
          height: 100%;
          background: var(--color-primary);
          border-radius: var(--radius-full);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stepper-pills {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .step-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px 4px 6px;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border-subtle);
          background: var(--color-surface);
          font-size: 0.82rem;
          color: var(--color-text-subtle);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .step-pill:disabled {
          cursor: default;
          opacity: 0.7;
        }

        .pill-number {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-surface-subtle);
          color: var(--color-text-subtle);
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-pill.completed {
          border-color: var(--color-primary-subtle);
          color: var(--color-text-secondary);
        }

        .step-pill.completed .pill-number {
          background: var(--color-primary-light);
          color: var(--color-primary);
        }

        .step-pill.completed:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .step-pill.current {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
          color: var(--color-primary);
          font-weight: 600;
        }

        .step-pill.current .pill-number {
          background: var(--color-primary);
          color: #ffffff;
        }

        @media (max-width: 600px) {
          .pill-title {
            display: none;
          }
          .step-pill {
            padding: 4px;
          }
        }
      `}</style>
    </div>
  );
}
