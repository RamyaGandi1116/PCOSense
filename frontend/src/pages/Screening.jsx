import React, { useState, useMemo, useEffect } from 'react';
import ProgressBar from '../components/ProgressBar';
import FormField from '../components/FormField';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Activity,
  Calculator,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { submitScreeningData, checkBackendHealth } from '../services/api';

const DEFAULT_FORM_DATA = {
  // Step 1: Basic Information
  Age: '20-25',
  Weight_kg: 55.0,
  Height_ft: 160.0,
  Marital_Status: 'Unmarried',

  // Step 2: Medical & Family History
  Family_History_PCOS: 'No',
  Diabetes: 'No',
  Cardiovascular_Disease: 'No',
  Childhood_Trauma: 'No',

  // Step 3: Symptoms & Health
  Menstrual_Irregularity: 'No',
  Hirsutism: 'No',
  Mental_Health: 'Yes',

  // Step 4: Lifestyle Factors
  Vegetarian: 'No',
  Exercise_Frequency: 'Rarely',
  Exercise_Type: 'No Exercise',
  Exercise_Duration: 'Not Applicable',
  Sleep_Hours: '6-8 hours',
  Stress_Level: 'Yes',
  Smoking: 'No',

  // Step 5: Dietary Habits (0 to 7 days/week)
  Diet_Bread_Cereals: 5,
  Diet_Milk_Products: 3,
  Diet_Fruits: 3,
  Diet_Vegetables: 4,
  Diet_Starchy_Vegetables: 3,
  Diet_NonStarchy_Vegetables: 3,
  Diet_Fats: 4,
  Diet_Sweets: 2,
  Diet_Fried_Food: 2,
  Diet_Tea_Coffee: 4,
  Diet_Multivitamin: 0,
};

const FORM_STEPS = [
  { id: 'basic', title: 'Basic Information', shortTitle: 'Basics' },
  { id: 'history', title: 'Medical & Family History', shortTitle: 'History' },
  { id: 'symptoms', title: 'Symptoms & Health', shortTitle: 'Symptoms' },
  { id: 'lifestyle', title: 'Lifestyle & Habits', shortTitle: 'Lifestyle' },
  { id: 'diet', title: 'Dietary Habits & Review', shortTitle: 'Diet & Review' }
];

export default function Screening({ onPredictionComplete, setActivePage }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('connecting'); // 'connecting' | 'online' | 'offline'

  // Poll backend health with graceful startup grace period (wait for model pipeline loading)
  useEffect(() => {
    let isMounted = true;
    let pollTimer = null;
    let attempts = 0;
    const maxStartupAttempts = 15; // 15 seconds grace period for model pipeline loading

    const checkStatus = async () => {
      try {
        await checkBackendHealth();
        if (isMounted) {
          setBackendStatus('online');
          setApiError(null);
        }
      } catch (err) {
        attempts += 1;
        if (attempts < maxStartupAttempts) {
          if (isMounted) {
            setBackendStatus('connecting');
            pollTimer = setTimeout(checkStatus, 1000);
          }
        } else {
          if (isMounted) {
            console.warn('[Screening] Backend offline after startup wait period:', err.message);
            setBackendStatus('offline');
          }
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, []);

  const handleManualRetry = async () => {
    setBackendStatus('connecting');
    setApiError(null);
    try {
      await checkBackendHealth();
      setBackendStatus('online');
    } catch (err) {
      console.warn('[Screening] Manual retry failed:', err.message);
      setBackendStatus('offline');
    }
  };

  // Real-time BMI calculation
  const computedBmi = useMemo(() => {
    const w = parseFloat(formData.Weight_kg);
    const h = parseFloat(formData.Height_ft);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      const heightInMeters = h / 100.0;
      const bmi = w / (heightInMeters * heightInMeters);
      return Math.round(bmi * 100) / 100;
    }
    return null;
  }, [formData.Weight_kg, formData.Height_ft]);

  const bmiCategory = useMemo(() => {
    if (!computedBmi) return null;
    if (computedBmi < 18.5) return { label: 'Underweight', badge: 'badge-coming-soon' };
    if (computedBmi < 25.0) return { label: 'Normal weight', badge: 'badge-risk-low' };
    if (computedBmi < 30.0) return { label: 'Overweight', badge: 'badge-primary' };
    return { label: 'Obese', badge: 'badge-risk-high' };
  }, [computedBmi]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on touch
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (apiError) setApiError(null);
  };

  // Validation by step
  const validateStep = (stepIndex) => {
    const newErrors = {};

    if (stepIndex === 0) {
      if (!formData.Age) newErrors.Age = 'Please select your age group.';
      const w = parseFloat(formData.Weight_kg);
      if (isNaN(w) || w < 30 || w > 180) newErrors.Weight_kg = 'Please enter a valid weight between 30 kg and 180 kg.';
      const h = parseFloat(formData.Height_ft);
      if (isNaN(h) || h < 110 || h > 210) newErrors.Height_ft = 'Please enter a valid height between 110 cm and 210 cm.';
      if (!formData.Marital_Status) newErrors.Marital_Status = 'Please select your marital status.';
    }

    if (stepIndex === 1) {
      if (!formData.Family_History_PCOS) newErrors.Family_History_PCOS = 'Required';
      if (!formData.Diabetes) newErrors.Diabetes = 'Required';
      if (!formData.Cardiovascular_Disease) newErrors.Cardiovascular_Disease = 'Required';
      if (!formData.Childhood_Trauma) newErrors.Childhood_Trauma = 'Required';
    }

    if (stepIndex === 2) {
      if (!formData.Menstrual_Irregularity) newErrors.Menstrual_Irregularity = 'Please indicate cycle regularity.';
      if (!formData.Hirsutism) newErrors.Hirsutism = 'Please indicate hirsutism status.';
      if (!formData.Mental_Health) newErrors.Mental_Health = 'Required';
    }

    if (stepIndex === 3) {
      if (!formData.Exercise_Frequency) newErrors.Exercise_Frequency = 'Please select exercise frequency.';
      if (!formData.Exercise_Type) newErrors.Exercise_Type = 'Please select exercise type.';
      if (!formData.Exercise_Duration) newErrors.Exercise_Duration = 'Please select duration.';
      if (!formData.Sleep_Hours) newErrors.Sleep_Hours = 'Please select average sleep hours.';
      if (!formData.Stress_Level) newErrors.Stress_Level = 'Required';
      if (!formData.Smoking) newErrors.Smoking = 'Required';
      if (!formData.Vegetarian) newErrors.Vegetarian = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, FORM_STEPS.length - 1));
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleReset = () => {
    if (window.confirm('Reset all questionnaire inputs back to defaults?')) {
      setFormData(DEFAULT_FORM_DATA);
      setErrors({});
      setApiError(null);
      setCurrentStep(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    setApiError(null);

    try {
      // Include precomputed BMI
      const payload = {
        ...formData,
        BMI: computedBmi
      };

      const result = await submitScreeningData(payload);
      onPredictionComplete({
        ...result,
        inputSummary: {
          Age: formData.Age,
          BMI: computedBmi,
          Weight_kg: formData.Weight_kg,
          Height_ft: formData.Height_ft,
          Menstrual_Irregularity: formData.Menstrual_Irregularity,
          Hirsutism: formData.Hirsutism,
          Family_History_PCOS: formData.Family_History_PCOS,
          Stress_Level: formData.Stress_Level
        }
      });
    } catch (err) {
      console.error('Prediction submission failed:', err);
      setApiError(err.message || 'Unable to complete prediction. Please verify the backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screening-page container-narrow">
      <div className="screening-header">
        <button
          type="button"
          className="back-home-btn"
          onClick={() => setActivePage('home')}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="screening-header-badges">
          {backendStatus === 'connecting' && (
            <span className="badge badge-secondary service-badge-status connecting" title="Connecting to screening service...">
              <Loader2 size={12} className="spin-icon" />
              Connecting...
            </span>
          )}
          {backendStatus === 'online' && (
            <span className="badge badge-risk-low service-badge-status" title="FastAPI backend connected and model ready">
              <span className="live-dot green"></span>
              Service Online
            </span>
          )}
          {backendStatus === 'offline' && (
            <button 
              type="button"
              className="badge badge-risk-high service-badge-status clickable"
              onClick={handleManualRetry}
              title="Screening server unreachable. Click to retry connection."
            >
              <WifiOff size={12} />
              Service Offline
            </button>
          )}
          <span className="badge badge-primary">PCOS Pre-Screening</span>
        </div>
      </div>

      {backendStatus === 'offline' && (
        <div className="service-offline-banner" role="alert">
          <div className="offline-banner-left">
            <WifiOff size={20} className="offline-icon" />
            <div>
              <strong>Screening Service Offline</strong>
              <p>
                The FastAPI screening service on port 8000 is not responding.
                When started with <code>npm run dev</code>, both frontend and backend run automatically together.
                Please check terminal output or click below to retry.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleManualRetry}
          >
            <RefreshCw size={13} />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      <div className="screening-intro">
        <h2>General Information Screening</h2>
        <p>
          Please complete the 5 short sections below. All questions are non-invasive and relate to self-observable 
          symptoms, demographics, and lifestyle factors.
        </p>
      </div>

      <ProgressBar 
        steps={FORM_STEPS} 
        currentStep={currentStep} 
        onStepClick={(idx) => {
          if (idx < currentStep) setCurrentStep(idx);
        }}
      />

      {/* Form Container */}
      <div className="screening-card card">
        <form onSubmit={handleSubmit} noValidate>
          
          {/* STEP 1: Basic Information */}
          {currentStep === 0 && (
            <div className="step-pane" key="step-1">
              <div className="step-header">
                <h3>Basic Demographics & Anthropometrics</h3>
                <p>Provide your age and physical measurements. Height and weight are used to compute Body Mass Index (BMI).</p>
              </div>

              <div className="grid-2-col">
                <FormField
                  name="Age"
                  label="Age Range"
                  type="dropdown"
                  value={formData.Age}
                  options={["Less than 20", "20-25", "25-30", "30-35", "35-44", "45 and above"]}
                  onChange={handleChange}
                  error={errors.Age}
                  helper="Age group at time of screening"
                />

                <FormField
                  name="Marital_Status"
                  label="Marital Status"
                  type="dropdown"
                  value={formData.Marital_Status}
                  options={["Unmarried", "Married", "Widow"]}
                  onChange={handleChange}
                  error={errors.Marital_Status}
                />
              </div>

              <div className="grid-2-col">
                <FormField
                  name="Weight_kg"
                  label="Weight"
                  type="number"
                  unit="kg"
                  min={30}
                  max={180}
                  step={0.5}
                  value={formData.Weight_kg}
                  onChange={handleChange}
                  error={errors.Weight_kg}
                  helper="Body weight in kilograms"
                />

                <FormField
                  name="Height_ft"
                  label="Height"
                  type="number"
                  unit="cm"
                  min={110}
                  max={210}
                  step={0.5}
                  value={formData.Height_ft}
                  onChange={handleChange}
                  error={errors.Height_ft}
                  helper="Height in centimeters (e.g. 5 ft 3 in = 160 cm)"
                />
              </div>

              {/* Real-time BMI Display Box */}
              {computedBmi && (
                <div className="bmi-live-card">
                  <div className="bmi-header">
                    <Calculator size={16} />
                    <span>Real-Time Body Mass Index (BMI)</span>
                  </div>
                  <div className="bmi-display-row">
                    <div className="bmi-value-box">
                      <span className="bmi-num">{computedBmi}</span>
                      <span className="bmi-unit">kg/m²</span>
                    </div>
                    {bmiCategory && (
                      <span className={`badge ${bmiCategory.badge}`}>
                        {bmiCategory.label}
                      </span>
                    )}
                  </div>
                  <p className="bmi-subtext">
                    Computed automatically as weight / (height/100)². BMI is strongly correlated with endocrine and metabolic variations in PCOS.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Medical & Family History */}
          {currentStep === 1 && (
            <div className="step-pane" key="step-2">
              <div className="step-header">
                <h3>Medical & Family History</h3>
                <p>Information on familial predisposition and prior diagnosed health conditions.</p>
              </div>

              <FormField
                name="Family_History_PCOS"
                label="Family History of PCOS"
                type="binary"
                value={formData.Family_History_PCOS}
                onChange={handleChange}
                error={errors.Family_History_PCOS}
                helper="Has a first-degree female relative (mother or sister) been clinically diagnosed with PCOS?"
              />

              <FormField
                name="Diabetes"
                label="Personal Diagnosis of Diabetes"
                type="binary"
                value={formData.Diabetes}
                onChange={handleChange}
                error={errors.Diabetes}
                helper="Have you been diagnosed with type 1 or type 2 diabetes?"
              />

              <FormField
                name="Cardiovascular_Disease"
                label="Cardiovascular Disease"
                type="binary"
                value={formData.Cardiovascular_Disease}
                onChange={handleChange}
                error={errors.Cardiovascular_Disease}
                helper="Personal medical history of hypertension or heart conditions."
              />

              <FormField
                name="Childhood_Trauma"
                label="History of Childhood Trauma / Chronic Adversity"
                type="binary"
                value={formData.Childhood_Trauma}
                onChange={handleChange}
                error={errors.Childhood_Trauma}
                helper="Self-reported significant emotional or psychological stress during development."
              />
            </div>
          )}

          {/* STEP 3: Symptoms & Health */}
          {currentStep === 2 && (
            <div className="step-pane" key="step-3">
              <div className="step-header">
                <h3>Observable Symptoms & Well-being</h3>
                <p>Cardinals signs associated with ovulatory function and androgenic activity.</p>
              </div>

              <FormField
                name="Menstrual_Irregularity"
                label="Menstrual Irregularity"
                type="binary"
                value={formData.Menstrual_Irregularity}
                onChange={handleChange}
                error={errors.Menstrual_Irregularity}
                helper="Cycles longer than 35 days, fewer than 8 periods a year, or absent menstruation."
              />

              <FormField
                name="Hirsutism"
                label="Hirsutism (Excess Body or Facial Hair)"
                type="binary"
                value={formData.Hirsutism}
                onChange={handleChange}
                error={errors.Hirsutism}
                helper="Coarse, dark hair growth on chin, upper lip, chest, abdomen, or inner thighs."
              />

              <FormField
                name="Mental_Health"
                label="Mental Health Symptoms (Anxiety / Depression)"
                type="binary"
                value={formData.Mental_Health}
                onChange={handleChange}
                error={errors.Mental_Health}
                helper="Persistent experiences of low mood, severe fatigue, or chronic anxiety."
              />
            </div>
          )}

          {/* STEP 4: Lifestyle & Habits */}
          {currentStep === 3 && (
            <div className="step-pane" key="step-4">
              <div className="step-header">
                <h3>Physical Activity, Sleep & Stress</h3>
                <p>Daily routines and behavioral factors influencing metabolic and endocrine balance.</p>
              </div>

              <div className="grid-2-col">
                <FormField
                  name="Exercise_Frequency"
                  label="Exercise Frequency"
                  type="dropdown"
                  value={formData.Exercise_Frequency}
                  options={["Never", "Rarely", "1-2 Times a Week", "3-4 Times a Week", "Daily"]}
                  onChange={handleChange}
                  error={errors.Exercise_Frequency}
                />

                <FormField
                  name="Exercise_Duration"
                  label="Exercise Duration"
                  type="dropdown"
                  value={formData.Exercise_Duration}
                  options={["Not Applicable", "Less than 30 minutes", "30 minutes", "30 minutes to 1 hour", "More than 30 minutes"]}
                  onChange={handleChange}
                  error={errors.Exercise_Duration}
                />
              </div>

              <FormField
                name="Exercise_Type"
                label="Typical Exercise Modality"
                type="dropdown"
                value={formData.Exercise_Type}
                options={[
                  "No Exercise",
                  "Cardio (e.g., running, cycling, swimming)",
                  "Flexibility and balance (e.g., yoga, pilates)",
                  "Strength training (e.g., weightlifting, resistance exercises)",
                  "High-intensity interval training (HIIT)"
                ]}
                onChange={handleChange}
                error={errors.Exercise_Type}
              />

              <div className="grid-2-col">
                <FormField
                  name="Sleep_Hours"
                  label="Average Sleep per Night"
                  type="dropdown"
                  value={formData.Sleep_Hours}
                  options={["Less than 6 hours", "6-8 hours", "9-12 hours", "More than 12 hours"]}
                  onChange={handleChange}
                  error={errors.Sleep_Hours}
                />

                <FormField
                  name="Vegetarian"
                  label="Vegetarian Diet"
                  type="binary"
                  value={formData.Vegetarian}
                  onChange={handleChange}
                  error={errors.Vegetarian}
                />
              </div>

              <div className="grid-2-col">
                <FormField
                  name="Stress_Level"
                  label="Elevated Daily Stress"
                  type="binary"
                  value={formData.Stress_Level}
                  onChange={handleChange}
                  error={errors.Stress_Level}
                  helper="Subjective chronic stress or high emotional load"
                />

                <FormField
                  name="Smoking"
                  label="Smoking Status"
                  type="binary"
                  value={formData.Smoking}
                  onChange={handleChange}
                  error={errors.Smoking}
                />
              </div>
            </div>
          )}

          {/* STEP 5: Dietary Habits & Review */}
          {currentStep === 4 && (
            <div className="step-pane" key="step-5">
              <div className="step-header">
                <h3>Nutritional Habits (Days Consumed per Week)</h3>
                <p>Move sliders from 0 (Never) to 7 (Daily) for each nutritional group.</p>
              </div>

              <div className="diet-grid">
                <FormField
                  name="Diet_Bread_Cereals"
                  label="Bread & Refined Cereals"
                  type="slider"
                  value={formData.Diet_Bread_Cereals}
                  onChange={handleChange}
                />

                <FormField
                  name="Diet_Sweets"
                  label="Sweets, Pastries & Sugary Snacks"
                  type="slider"
                  value={formData.Diet_Sweets}
                  onChange={handleChange}
                />

                <FormField
                  name="Diet_Fried_Food"
                  label="Fried & Fast Foods"
                  type="slider"
                  value={formData.Diet_Fried_Food}
                  onChange={handleChange}
                />

                <FormField
                  name="Diet_Fats"
                  label="Dietary Oils, Butter & Fats"
                  type="slider"
                  value={formData.Diet_Fats}
                  onChange={handleChange}
                />

                <FormField
                  name="Diet_Fruits"
                  label="Fresh Fruits"
                  type="slider"
                  value={formData.Diet_Fruits}
                  onChange={handleChange}
                />

                <FormField
                  name="Diet_Vegetables"
                  label="Fresh Green Vegetables"
                  type="slider"
                  value={formData.Diet_Vegetables}
                  onChange={handleChange}
                />

                <FormField
                  name="Diet_Starchy_Vegetables"
                  label="Starchy Vegetables (Potatoes, Corn)"
                  type="slider"
                  value={formData.Diet_Starchy_Vegetables}
                  onChange={handleChange}
                />

                <FormField
                  name="Diet_NonStarchy_Vegetables"
                  label="Non-Starchy Vegetables"
                  type="slider"
                  value={formData.Diet_NonStarchy_Vegetables}
                  onChange={handleChange}
                />

                <FormField
                  name="Diet_Milk_Products"
                  label="Milk & Dairy Products"
                  type="slider"
                  value={formData.Diet_Milk_Products}
                  onChange={handleChange}
                />

                <FormField
                  name="Diet_Tea_Coffee"
                  label="Tea / Coffee"
                  type="slider"
                  value={formData.Diet_Tea_Coffee}
                  onChange={handleChange}
                />

                <FormField
                  name="Diet_Multivitamin"
                  label="Multivitamin Supplements"
                  type="slider"
                  value={formData.Diet_Multivitamin}
                  onChange={handleChange}
                />
              </div>

              {/* Review Summary Box */}
              <div className="review-summary-card">
                <div className="review-header">
                  <CheckCircle2 size={18} className="review-check-icon" />
                  <h4>Pre-Submission Profile Summary</h4>
                </div>

                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-lbl">Age Group:</span>
                    <span className="review-val">{formData.Age}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-lbl">Body Mass Index:</span>
                    <span className="review-val">{computedBmi} kg/m² ({bmiCategory?.label})</span>
                  </div>
                  <div className="review-item">
                    <span className="review-lbl">Menstrual Cycles:</span>
                    <span className="review-val">{formData.Menstrual_Irregularity === 'Yes' ? 'Irregular / Infrequent' : 'Regular'}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-lbl">Hirsutism Signs:</span>
                    <span className="review-val">{formData.Hirsutism}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-lbl">Family History:</span>
                    <span className="review-val">{formData.Family_History_PCOS}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-lbl">Stress Level:</span>
                    <span className="review-val">{formData.Stress_Level}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Error Notification */}
          {apiError && (
            <div className="form-error-alert" role="alert">
              <AlertCircle size={18} />
              <span>{apiError}</span>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="form-actions-footer">
            <div className="footer-left">
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={handleReset}
                title="Reset all inputs"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>

              {currentStep > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
              )}
            </div>

            <div className="footer-right">
              {currentStep < FORM_STEPS.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Analyzing Screening Profile...</span>
                    </>
                  ) : (
                    <>
                      <Activity size={16} />
                      <span>Calculate Risk Estimate</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .screening-page {
          padding: 40px 0 60px 0;
        }

        .screening-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .screening-header-badges {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .service-badge-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          padding: 4px 10px;
        }

        .service-badge-status.connecting {
          color: var(--color-text-secondary);
          background: var(--color-surface-subtle);
          border: 1px solid var(--color-border);
        }

        .service-badge-status.clickable {
          cursor: pointer;
          border: none;
          transition: opacity 0.15s ease;
        }

        .service-badge-status.clickable:hover {
          opacity: 0.85;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
        }

        .live-dot.green {
          background: var(--color-risk-low);
          box-shadow: 0 0 0 2px rgba(46, 125, 90, 0.2);
        }

        .service-offline-banner {
          background: #fdf5f5;
          border: 1px solid #f2c7c7;
          border-radius: var(--radius-md);
          padding: 14px 18px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .offline-banner-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .offline-icon {
          color: var(--color-risk-high);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .offline-banner-left strong {
          color: var(--color-risk-high);
          display: block;
          font-size: 0.92rem;
          margin-bottom: 4px;
        }

        .offline-banner-left p {
          color: var(--color-text-secondary);
          font-size: 0.84rem;
          margin: 0;
          line-height: 1.4;
        }

        .offline-banner-left code {
          background: #f4e8e8;
          color: #a32222;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          margin-left: 4px;
          font-family: monospace;
        }

        .back-home-btn {
          background: none;
          border: none;
          padding: 6px 0;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .back-home-btn:hover {
          color: var(--color-primary);
        }

        .screening-intro {
          margin-bottom: 28px;
        }

        .screening-intro h2 {
          font-size: 1.85rem;
          margin-bottom: 8px;
        }

        .screening-card {
          padding: 36px;
          border-radius: var(--radius-lg);
          background: #ffffff;
        }

        .step-header {
          margin-bottom: 24px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .step-header h3 {
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .step-header p {
          font-size: 0.9rem;
          margin-bottom: 0;
        }

        .grid-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .bmi-live-card {
          background: var(--color-surface-subtle);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          margin-top: 10px;
        }

        .bmi-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-primary);
          margin-bottom: 10px;
        }

        .bmi-display-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 8px;
        }

        .bmi-value-box {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .bmi-num {
          font-size: 2.1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }

        .bmi-unit {
          font-size: 0.9rem;
          color: var(--color-text-subtle);
        }

        .bmi-subtext {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          margin-bottom: 0;
          line-height: 1.4;
        }

        .diet-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 24px;
          margin-bottom: 24px;
        }

        .review-summary-card {
          background: var(--color-surface-subtle);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-top: 24px;
        }

        .review-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }

        .review-check-icon {
          color: var(--color-primary);
        }

        .review-header h4 {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 0;
        }

        .review-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 16px;
        }

        .review-item {
          display: flex;
          flex-direction: column;
        }

        .review-lbl {
          font-size: 0.78rem;
          color: var(--color-text-subtle);
        }

        .review-val {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .form-error-alert {
          background: var(--color-risk-high-bg);
          border: 1px solid var(--color-risk-high-border);
          color: var(--color-risk-high);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          margin-top: 20px;
        }

        .form-actions-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid var(--color-border);
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 680px) {
          .screening-card {
            padding: 24px 18px;
          }
          .grid-2-col {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .diet-grid {
            grid-template-columns: 1fr;
          }
          .review-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
