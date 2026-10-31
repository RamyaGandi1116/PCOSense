import React, { useState } from 'react';
import { 
  UploadCloud, 
  Clock, 
  FileText, 
  ArrowRight, 
  Info,
  X
} from 'lucide-react';

export default function Ultrasound({ setActivePage }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="ultrasound-page container-narrow">
      {/* Page Header */}
      <div className="ultrasound-header text-center">
        <span className="badge badge-coming-soon">Modality Preview</span>
        <h2>Ultrasound Analysis</h2>
        <p className="lead">
          Future image-based screening capability using pelvic ultrasound analysis.
        </p>
      </div>

      {/* Prominent Coming Soon Alert Banner */}
      <div className="coming-soon-banner card">
        <div className="banner-icon-col">
          <Clock size={28} className="banner-clock-icon" />
        </div>
        <div className="banner-body">
          <h3>Ultrasound Analysis Coming Soon</h3>
          <p>
            Automated image-based follicle quantification and ovarian morphology assessment will be released in an upcoming update. 
            To maintain strict clinical safety and diagnostic integrity, this capability is currently in multi-center validation 
            and <strong>does not generate automated predictions</strong> at this time.
          </p>
          <div className="banner-cta-row">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setActivePage('screening')}
            >
              <span>Use General Information Screening</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Mock Upload Interface for Future Integration */}
      <div className="card upload-card">
        <div className="upload-card-header">
          <h3>Upload Pelvic Ultrasound Scan</h3>
          <p>Test the file staging interface for future transvaginal ultrasound image evaluation.</p>
        </div>

        {!selectedFile ? (
          <div 
            className={`dropzone-box ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="dropzone-icon">
              <UploadCloud size={40} />
            </div>
            <h4>Drag & drop ultrasound image here</h4>
            <p className="dropzone-sub">Supports DICOM, PNG, and JPG formats (max 25MB)</p>
            
            <label className="btn btn-secondary btn-browse">
              <span>Browse Image Files</span>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/dicom" 
                onChange={handleFileChange}
                className="hidden-file-input"
              />
            </label>
          </div>
        ) : (
          <div className="file-preview-card">
            <div className="preview-top-row">
              <div className="file-details">
                <FileText size={20} className="file-icon" />
                <div>
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-clear" 
                onClick={handleClear}
                title="Remove image"
              >
                <X size={18} />
              </button>
            </div>

            {previewUrl && (
              <div className="image-preview-wrapper">
                <img src={previewUrl} alt="Ultrasound preview" className="ultrasound-preview-img" />
              </div>
            )}

            <div className="mock-run-row">
              <div className="disabled-notice">
                <Info size={16} />
                <span>Prediction disabled — awaiting model validation.</span>
              </div>
              <button 
                type="button" 
                className="btn btn-primary"
                disabled={true}
              >
                Run Image Screening (Coming Soon)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clinical Context on Ultrasound under Rotterdam Criteria */}
      <div className="card info-card">
        <div className="info-card-header">
          <Info size={18} className="info-icon" />
          <h4>Clinical Context: Ultrasound & The Rotterdam Criteria</h4>
        </div>
        <p className="info-card-body">
          Under the consensus <strong>Rotterdam Criteria (2003)</strong> and updated 2023 International Evidence-Based Guidelines, 
          Polycystic Ovarian Morphology (PCOM) is defined by either:
        </p>
        <ul className="info-bullet-list">
          <li><strong>Follicle Count:</strong> Presence of 20 or more follicles (measuring 2–9 mm in diameter) in either ovary on modern high-frequency ultrasound.</li>
          <li><strong>Ovarian Volume:</strong> An ovarian volume equal to or exceeding 10 mL in either ovary (in the absence of a dominant follicle).</li>
        </ul>
        <p className="info-card-sub">
          When integrated, our upcoming multimodal CNN pipeline will cross-reference segmented ultrasound follicle metrics 
          with the tabular questionnaire predictions to deliver comprehensive risk assessments.
        </p>
      </div>

      <style>{`
        .ultrasound-page {
          padding: 40px 0 60px 0;
        }

        .ultrasound-header {
          margin-bottom: 28px;
        }

        .ultrasound-header h2 {
          font-size: 2rem;
          margin-top: 8px;
          margin-bottom: 8px;
        }

        .coming-soon-banner {
          background: #fbf9f4;
          border: 1px solid #ebd9c2;
          display: flex;
          gap: 20px;
          padding: 24px;
          margin-bottom: 32px;
        }

        .banner-icon-col {
          color: #92531d;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .banner-body h3 {
          font-size: 1.15rem;
          color: #723b0d;
          margin-bottom: 8px;
        }

        .banner-body p {
          font-size: 0.92rem;
          color: #6d5d4b;
          line-height: 1.55;
          margin-bottom: 16px;
        }

        .upload-card {
          margin-bottom: 28px;
          padding: 32px;
        }

        .upload-card-header {
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .upload-card-header h3 {
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .upload-card-header p {
          font-size: 0.9rem;
          margin-bottom: 0;
        }

        .dropzone-box {
          border: 2px dashed var(--color-border-strong);
          border-radius: var(--radius-md);
          background: var(--color-surface-subtle);
          padding: 48px 24px;
          text-align: center;
          transition: all 0.2s ease;
        }

        .dropzone-box.drag-active {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
        }

        .dropzone-icon {
          color: var(--color-primary);
          margin-bottom: 14px;
        }

        .dropzone-box h4 {
          font-size: 1.05rem;
          margin-bottom: 6px;
        }

        .dropzone-sub {
          font-size: 0.84rem;
          color: var(--color-text-subtle);
          margin-bottom: 20px;
        }

        .hidden-file-input {
          display: none;
        }

        .btn-browse {
          cursor: pointer;
        }

        .file-preview-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .preview-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--color-surface-subtle);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .file-details {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .file-icon {
          color: var(--color-primary);
        }

        .file-name {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .file-size {
          font-size: 0.78rem;
          color: var(--color-text-subtle);
        }

        .btn-clear {
          background: none;
          border: none;
          color: var(--color-text-subtle);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
        }

        .btn-clear:hover {
          color: var(--color-risk-high);
        }

        .image-preview-wrapper {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          max-height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
        }

        .ultrasound-preview-img {
          max-height: 320px;
          width: auto;
          object-fit: contain;
        }

        .mock-run-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 10px;
        }

        .disabled-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          color: var(--color-text-subtle);
        }

        .info-card {
          background: #ffffff;
        }

        .info-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .info-icon {
          color: var(--color-primary);
        }

        .info-card-header h4 {
          font-size: 0.95rem;
          margin-bottom: 0;
        }

        .info-card-body {
          font-size: 0.9rem;
          line-height: 1.55;
          margin-bottom: 12px;
        }

        .info-bullet-list {
          padding-left: 20px;
          margin-bottom: 14px;
          font-size: 0.88rem;
          color: var(--color-text-secondary);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .info-card-sub {
          font-size: 0.84rem;
          color: var(--color-text-subtle);
          margin-bottom: 0;
          line-height: 1.5;
        }

        @media (max-width: 600px) {
          .coming-soon-banner {
            flex-direction: column;
            gap: 12px;
          }
          .mock-run-row {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          .mock-run-row .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
