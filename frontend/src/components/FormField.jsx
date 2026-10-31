import React from 'react';

export default function FormField({
  name,
  label,
  type = 'text',
  value,
  onChange,
  options = [],
  unit,
  min,
  max,
  step = 1,
  error,
  helper,
  required = true,
  disabled = false,
}) {
  const inputId = `field-${name}`;

  return (
    <div className="form-group">
      <div className="form-label-row">
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span className="req-marker" aria-hidden="true">*</span>}
        </label>
        {unit && <span className="field-unit">Unit: {unit}</span>}
      </div>

      {/* Dropdown Input */}
      {type === 'dropdown' && (
        <div className="select-wrapper">
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            className={`form-select ${error ? 'has-error' : ''}`}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
          >
            <option value="" disabled>-- Select an option --</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Binary Yes/No Radio Toggle for improved ergonomics */}
      {type === 'binary' && (
        <div className="binary-toggle-group" role="radiogroup" aria-labelledby={inputId}>
          {['No', 'Yes'].map((opt) => (
            <label
              key={opt}
              className={`binary-btn ${value === opt ? 'active' : ''} ${error ? 'has-error' : ''}`}
            >
              <input
                type="radio"
                name={name}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(name, opt)}
                disabled={disabled}
                className="visually-hidden"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* Number Input */}
      {type === 'number' && (
        <div className="number-input-wrapper">
          <input
            id={inputId}
            type="number"
            name={name}
            value={value}
            onChange={(e) => onChange(name, e.target.value === '' ? '' : parseFloat(e.target.value))}
            min={min}
            max={max}
            step={step}
            className={`form-control ${error ? 'has-error' : ''}`}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
          />
          {unit && <span className="inline-unit">{unit}</span>}
        </div>
      )}

      {/* Slider Input */}
      {type === 'slider' && (
        <div className="slider-wrapper">
          <div className="slider-controls">
            <input
              id={inputId}
              type="range"
              name={name}
              value={value ?? 0}
              onChange={(e) => onChange(name, parseInt(e.target.value, 10))}
              min={min ?? 0}
              max={max ?? 7}
              step={step ?? 1}
              className="slider-input"
              disabled={disabled}
              aria-invalid={!!error}
            />
            <div className="slider-badge">
              <span className="slider-qty">{value ?? 0}</span>
              <span className="slider-unit-label">{unit || 'days/wk'}</span>
            </div>
          </div>
          <div className="slider-endpoints">
            <span>{min ?? 0} days (Never)</span>
            <span>{max ?? 7} days (Daily)</span>
          </div>
        </div>
      )}

      {/* Helper text or Error message */}
      {error ? (
        <p id={`${inputId}-error`} className="form-error" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p id={`${inputId}-helper`} className="form-helper">
          {helper}
        </p>
      ) : null}

      <style>{`
        .form-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .req-marker {
          color: var(--color-risk-high);
          margin-left: 2px;
        }

        .field-unit {
          font-size: 0.76rem;
          color: var(--color-text-subtle);
          font-weight: 500;
        }

        .select-wrapper {
          position: relative;
        }

        .number-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .number-input-wrapper .inline-unit {
          position: absolute;
          right: 12px;
          color: var(--color-text-subtle);
          font-size: 0.85rem;
          pointer-events: none;
        }

        .binary-toggle-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .binary-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-surface);
          color: var(--color-text-secondary);
          font-size: 0.92rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .binary-btn:hover {
          border-color: var(--color-border-strong);
          background: var(--color-surface-hover);
        }

        .binary-btn.active {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
          color: var(--color-primary);
          font-weight: 600;
        }

        .binary-btn.has-error {
          border-color: var(--color-risk-high);
        }

        .visually-hidden {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .slider-wrapper {
          padding-top: 4px;
        }

        .slider-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .slider-badge {
          display: flex;
          align-items: baseline;
          gap: 4px;
          background: var(--color-surface-subtle);
          border: 1px solid var(--color-border);
          padding: 3px 10px;
          border-radius: var(--radius-md);
          min-width: 82px;
          justify-content: center;
        }

        .slider-qty {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-primary);
          font-variant-numeric: tabular-nums;
        }

        .slider-unit-label {
          font-size: 0.75rem;
          color: var(--color-text-subtle);
        }

        .slider-endpoints {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--color-text-subtle);
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
