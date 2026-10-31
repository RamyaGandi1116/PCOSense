# PCOSense – PCOS Risk Screening Application

An ML-powered PCOS risk screening application that combines a trained machine learning model with an interactive web interface.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Why I Built This Project](#why-i-built-this-project)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Machine Learning Workflow](#machine-learning-workflow)
- [Model Evaluation](#model-evaluation)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [Dataset Acquisition](#dataset-acquisition)
- [API Endpoints](#api-endpoints)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Disclaimer](#disclaimer)

---

## About the Project

**PCOSense** is an educational, full-stack machine learning application designed to explore early risk screening for Polycystic Ovary Syndrome (PCOS).

The application allows users to complete a structured 5-step questionnaire covering 30 pre-diagnostic lifestyle, demographic, nutritional, and symptom indicators. When submitted, a FastAPI backend runs the inputs through a serialized Scikit-learn pipeline (featuring automated column transformation and a regularized Random Forest classifier) to return an estimated risk probability, risk category (*Higher Risk* or *Lower Risk*), calculated Body Mass Index (BMI), and relevant reported clinical indicators based on Rotterdam consensus criteria.

PCOSense is built as a non-invasive risk screening prototype, not a medical diagnostic tool. Its purpose is to help individuals better understand their symptoms and encourage timely discussions with healthcare professionals.

---

## Why I Built This Project

Polycystic Ovary Syndrome affects an estimated 8% to 13% of women of reproductive age worldwide, yet up to 70% of affected women remain undiagnosed. Many patients experience delays of two or more years and multiple doctor visits before receiving an accurate diagnosis.

While studying healthcare machine learning, I noticed that many tutorials and student projects stop at a Jupyter notebook. Furthermore, many existing PCOS models in literature suffer from target leakage—they include variables like lab test results, hormone injections, or post-diagnosis medications that an undiagnosed person at home could never know.

I built PCOSense to solve both problems:
1. **Audited Data Pipeline:** Build a machine learning pipeline that strictly excludes post-diagnostic lab tests and treatments, relying only on self-reportable pre-screening factors.
2. **Complete Full-Stack Integration:** Connect the trained model to a working FastAPI backend and an accessible React frontend, creating a functional, user-facing screening tool rather than leaving the model as an exported pickle file.

---

## Features

- **5-Step Screening Questionnaire:** Clean, guided form covering Basic Information, Medical & Family History, Symptoms, Lifestyle, and Dietary Habits.
- **Client-Side BMI Calculation:** Calculates Body Mass Index in real time from height and weight, displaying standard WHO categories (Underweight, Normal weight, Overweight, Obese).
- **Risk Stratification:** Classifies submitted profiles into *Lower Risk* or *Higher Risk* with an associated percentage estimate.
- **Relevant Reported Indicators:** Highlights user-reported symptoms (such as irregular cycles or hirsutism) alongside established Rotterdam criteria context, without misleadingly claiming to be SHAP or feature importance values.
- **Service Status Detection:** The frontend automatically monitors the backend `/health` status and informs the user if the inference service is offline or starting up.
- **Ultrasound Staging Page:** A preview interface showcasing the planned multimodal extension for pelvic ultrasound image analysis (labeled "Coming Soon").

---

## Technology Stack

### Frontend
- **Framework:** React 19 (`react ^19.2.8`)
- **Build Tool:** Vite (`vite ^8.3.1`)
- **Icons:** Lucide React (`lucide-react ^1.48.0`)
- **Styling:** Custom CSS with CSS custom properties (clean healthcare aesthetic, responsive, no bulky UI libraries)
- **Code Quality:** Oxlint (`oxlint ^1.81.0`)

### Backend (Verified Runtime Environment)
- **Runtime:** Python 3.11.0
- **Framework:** FastAPI (`fastapi==0.141.1`)
- **ASGI Server:** Uvicorn (`uvicorn==0.54.0`)
- **Validation:** Pydantic v2 (`pydantic==2.13.5`)
- **Data Handling:** Pandas (`pandas==3.0.6`), NumPy (`numpy==2.4.6`)
- **Machine Learning:** Scikit-learn (`scikit-learn==1.9.1`), Joblib (`joblib==1.6.0`)
- **Developer Orchestration:** `concurrently` (`^9.1.2`) for unified single-terminal startup

---

## Application Architecture

```text
React Frontend (Vite, Port 5173)
       │
       │ HTTP POST /predict (JSON payload)
       ▼
FastAPI Backend (Uvicorn, Port 8000)
       │
       ├─► Pydantic v2 Validation (ScreeningInput schema)
       ├─► Compute objective BMI from Height & Weight
       ├─► Format Pandas DataFrame with exact 30 training features
       │
       ▼
Scikit-learn Pipeline (models/pcos_prediction_model.pkl)
       │
       ├─► ColumnTransformer
       │     ├── StandardScaler (14 numerical features: Weight, Height, Diet items, BMI)
       │     └── OneHotEncoder(handle_unknown='ignore') (16 categorical features)
       │
       ▼
RandomForestClassifier (max_depth=3, n_estimators=50, class_weight='balanced')
       │
       ▼
FastAPI Response Formatting
       │
       │ HTTP 200 OK (JSON with risk probability, risk level, BMI, indicators, guidance)
       ▼
React Result Page (Visual gauge, indicator cards, recommendations, medical disclaimer)
```

1. The user completes the 5 questionnaire steps in React.
2. The frontend sends the profile to `POST /predict`. In development, Vite proxies `/api/predict` directly to `http://127.0.0.1:8000/predict`.
3. FastAPI validates the request using Pydantic. If values are out of bounds (e.g., negative weight or invalid options), an HTTP 422 error is returned with clear diagnostics.
4. The backend constructs a single-row DataFrame and passes it to the loaded pipeline.
5. The pipeline transforms the raw features and calls `predict_proba()`.
6. The resulting score is packaged into a structured response containing the risk classification, BMI, clinical indicator context, next-step recommendations, and mandatory medical disclaimers.

---

## Machine Learning Workflow

The model development process is documented in detail in [`PCOS.ipynb`](PCOS.ipynb):

1. **Dataset Ingestion & Cleaning:**
   - Raw survey data contained 173 records across 36 features.
   - One record contained an ambiguous target value (`"No, Yes, not diagnosed by a doctor"`) and was excluded from binary classification modeling, leaving 172 valid records (33 positive cases, 139 negative cases).

2. **Leakage Audit & Feature Selection:**
   Six features were identified as post-diagnostic leakage or biochemical laboratory tests and were removed:
   - `PCOS_Medication`: Direct post-diagnosis medical treatment.
   - `Hyperandrogenism`: Clinical/biochemical laboratory assay (observable outward symptoms are represented by `Hirsutism`).
   - `Insulin_Resistance`: Biochemical diagnostic test (fasting insulin / HOMA-IR) unavailable at home.
   - `Hormonal_Imbalance`: Endocrinologist diagnosis acting as a direct target proxy.
   - `Conception_Difficulty`: Infertility clinic workup; >90% of respondents were unmarried young women.
   - `Exercise_Benefit`: Retrospective perception of symptom relief after exercise.

3. **Feature Engineering:**
   - BMI was computed on a per-row basis ($Weight / (Height / 100)^2$) using `Weight_kg` and `Height_ft` (recorded in centimeters in the dataset). No global statistics were computed, preventing data snooping.

4. **Pipeline Construction:**
   - Preprocessing was encapsulated in a `ColumnTransformer`:
     - 14 numerical features scaled with `StandardScaler`.
     - 16 categorical features encoded with `OneHotEncoder(handle_unknown='ignore')`.
   - All transformations were fitted strictly inside cross-validation folds.

5. **Model Selection & Regularization:**
   - Evaluated multiple candidate algorithms (Logistic Regression, Random Forest).
   - Selected a regularized `RandomForestClassifier`:
     ```python
     RandomForestClassifier(
         n_estimators=50,
         max_depth=3,
         class_weight='balanced',
         random_state=42
     )
     ```
   - Restricting `max_depth=3` and setting `n_estimators=50` helped constrain tree complexity on a small dataset, while `class_weight='balanced'` adjusted for the 1:4 class imbalance.

---

## Model Evaluation

The model was evaluated on an untouched held-out test set ($N=35$, consisting of 8 positive cases and 27 negative cases) following 5-fold Stratified Cross-Validation on the training set ($N=137$):

| Metric | Score | Context |
| :--- | :---: | :--- |
| **Sensitivity / Recall ('Yes')** | **75.0%** | Detected 6 of 8 positive cases in the held-out test set |
| **ROC-AUC Score** | **0.8472** | Good class separation across decision thresholds |
| **Test Accuracy** | **77.14%** | Overall correct classifications on test samples |
| **Balanced Accuracy** | **76.39%** | Average recall across positive (75.0%) and negative (77.78%) classes |
| **Precision ('Yes')** | **50.0%** | 6 true positives out of 12 positive predictions |
| **F1-Score ('Yes')** | **0.6000** | Harmonic mean of precision and recall for positive class |
| **Brier Score** | **0.1747** | Mean squared difference between predicted probabilities and actual outcomes |

> **Note on Probabilities:** Output probabilities represent ensemble voting proportions from the Random Forest trees. Formal post-hoc calibration (e.g., Platt scaling or isotonic regression) was omitted because the held-out validation set was too small to reliably calibrate probabilities without overfitting.

---

## Project Structure

```text
PCOSense/
├── backend/
│   ├── main.py                     # FastAPI backend application & API routes
│   ├── run.py                      # Pre-flight validation & backend launcher
│   ├── test_backend.py             # Backend unit and integration tests
│   ├── verify_consistency.py       # Contract consistency audit script
│   └── requirements.txt            # Pinned Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header navigation bar
│   │   │   ├── Footer.jsx          # Footer with medical disclaimers
│   │   │   ├── FormField.jsx       # Accessible form input controls
│   │   │   ├── ProgressBar.jsx     # Multi-step progress indicator
│   │   │   └── RiskGauge.jsx       # Visual gauge for risk percentage
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Landing page with modality cards
│   │   │   ├── Screening.jsx       # 5-step risk assessment form
│   │   │   ├── Result.jsx          # Assessment results & explanation
│   │   │   ├── About.jsx           # Methodology & Rotterdam criteria background
│   │   │   └── Ultrasound.jsx      # Ultrasound module preview
│   │   ├── services/
│   │   │   └── api.js              # Fetch client with failover & proxy handling
│   │   ├── styles/
│   │   │   ├── variables.css       # Design tokens & color system
│   │   │   └── index.css           # Global typography & layout rules
│   │   ├── App.jsx                 # Client routing & page state
│   │   └── main.jsx                # React entrypoint
│   ├── index.html                  # HTML template with page title & metadata
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite server & dev proxy configuration
│   └── README.md                   # Frontend documentation
│
├── models/
│   ├── pcos_prediction_model.pkl   # Serialized Scikit-learn Pipeline (85 KB)
│   ├── model_metadata.json         # Evaluation metrics & feature names
│   └── frontend_input_schema.json  # Feature schema used by UI and backend
│
├── .gitignore                      # Git ignore rules (datasets, caches, node_modules)
├── LICENSE                         # MIT License with third-party data notice
├── package.json                    # Root npm scripts & concurrently orchestration
├── PCOS.ipynb                      # Complete 42-section Jupyter research notebook
└── README.md                       # Main project documentation
```

---

## Installation and Setup

### Prerequisites
- **Python:** 3.10 or 3.11 (tested on Python 3.11.0)
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### Windows & VS Code Setup

1. **Clone the repository and open the project folder:**
   ```powershell
   git clone https://github.com/<your-username>/PCOSense.git
   cd PCOSense
   code .
   ```

2. **Create and activate a Python virtual environment:**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
   *(If script execution is disabled in PowerShell, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

3. **Install Python backend dependencies:**
   ```powershell
   pip install -r backend/requirements.txt
   ```

4. **Install Node.js dependencies:**
   ```powershell
   npm install
   npm run install:frontend
   ```

5. **(Optional) Verify backend consistency and run unit tests:**
   ```powershell
   python backend/verify_consistency.py
   python -m unittest backend/test_backend.py
   ```

---

## Running the Application

### Start Both Services (Single Command)

From the project root directory, run:

```powershell
npm run dev
```

This starts both services simultaneously with color-coded logging:
- `[backend]` **FastAPI Server** running on `http://127.0.0.1:8000` (runs pre-flight dependency and port checks).
- `[frontend]` **Vite React Server** running on `http://localhost:5173` (proxies `/api` requests to FastAPI).

Open your browser at:
👉 **`http://localhost:5173`**

### Individual Service Commands (Optional)

- **Backend only:** `python backend/run.py` (or `npm run dev:backend`)
- **Frontend only:** `npm run dev --prefix frontend` (or `npm run dev:frontend`)
- **Production frontend build:** `npm run build`
- **Frontend code linter:** `npm run lint --prefix frontend`
- **FastAPI interactive Swagger docs:** `http://127.0.0.1:8000/docs`

---

## Dataset Acquisition

> [!IMPORTANT]
> The raw survey dataset is **not distributed in this repository** to comply with third-party data sharing terms. 
> The web application, backend API, and unit tests run standalone out of the box because the trained model pipeline (`models/pcos_prediction_model.pkl`) is already serialized and included.

If you wish to inspect, re-train, or execute the Jupyter notebook ([`PCOS.ipynb`](PCOS.ipynb)):

1. Download the authorized dataset from Kaggle:
   👉 [**Diet, Exercise, and PCOS Insights** by Hasaan Rana on Kaggle](https://www.kaggle.com/datasets/hasaanrana/diet-exercise-and-pcos-insights)
2. Place the downloaded file directly into the project root directory and ensure it is named:
   ```text
   Cleaned-Data(1).csv.xls
   ```
3. Open and run [`PCOS.ipynb`](PCOS.ipynb) in VS Code or Jupyter Notebook.

The dataset is included in `.gitignore` so it will not be committed to version control.

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Service status, model load check, and API version |
| `GET` | `/health` | Health check verifying model pipeline is active in memory |
| `GET` | `/schema` | Returns feature definitions and allowable form options |
| `GET` | `/model-info` | Returns model hyperparameters and test metrics |
| `POST` | `/predict` | Evaluates submitted user features and returns risk assessment |

### Example Request (`POST /predict`)
```json
{
  "Age": "20-25",
  "Weight_kg": 78.0,
  "Height_ft": 157.48,
  "Marital_Status": "Unmarried",
  "Family_History_PCOS": "Yes",
  "Menstrual_Irregularity": "Yes",
  "Hirsutism": "Yes",
  "Mental_Health": "Yes",
  "Diabetes": "No",
  "Childhood_Trauma": "Yes",
  "Cardiovascular_Disease": "No",
  "Diet_Bread_Cereals": 6,
  "Diet_Milk_Products": 5,
  "Diet_Fruits": 2,
  "Diet_Vegetables": 3,
  "Diet_Starchy_Vegetables": 4,
  "Diet_NonStarchy_Vegetables": 2,
  "Diet_Fats": 6,
  "Diet_Sweets": 6,
  "Diet_Fried_Food": 5,
  "Diet_Tea_Coffee": 7,
  "Diet_Multivitamin": 0,
  "Vegetarian": "No",
  "Exercise_Frequency": "Never",
  "Exercise_Type": "No Exercise",
  "Exercise_Duration": "Not Applicable",
  "Sleep_Hours": "Less than 6 hours",
  "Stress_Level": "Yes",
  "Smoking": "No"
}
```

### Example Response (`HTTP 200 OK`)
```json
{
  "prediction": "Yes",
  "risk_probability": 0.8176,
  "risk_percentage": 81.8,
  "risk_level": "Higher Risk",
  "bmi": 31.45,
  "bmi_category": "Obese",
  "contributing_factors": [
    {
      "factor": "Menstrual Cycle Irregularity",
      "status": "Reported",
      "impact": "Primary clinical symptom",
      "description": "Irregular cycles or anovulation is one of the cardinal diagnostic criteria under Rotterdam consensus."
    },
    {
      "factor": "Hirsutism (Excess Body/Facial Hair)",
      "status": "Reported",
      "impact": "Clinical hyperandrogenism sign",
      "description": "Excessive hair growth in an androgenic distribution is an observable physical hallmark of PCOS."
    },
    {
      "factor": "Body Mass Index (BMI)",
      "status": "31.45 kg/m² (Obese)",
      "impact": "Metabolic indicator",
      "description": "Higher adiposity frequently correlates with insulin resistance and ovulatory dysfunction."
    }
  ],
  "recommendations": [
    "Schedule a consultation with a gynecologist or endocrinologist.",
    "Share your symptom timeline, particularly menstrual irregularity and any physical changes.",
    "Discuss whether diagnostic bloodwork (LH/FSH, free testosterone) or a pelvic ultrasound is warranted."
  ],
  "disclaimer": "This result is an AI-assisted statistical screening estimate derived from a questionnaire-based machine learning model. It is intended strictly for preliminary risk stratification and educational purposes. It does NOT constitute a clinical diagnosis or medical confirmation. Please consult a qualified healthcare provider for personalized medical evaluation."
}
```

---

## Limitations

1. **Small Dataset Size:** The model was trained on 172 survey samples. While cross-validation and regularized hyperparameters (`max_depth=3`) help mitigate overfitting, statistical variance is higher than it would be on large multi-center clinical datasets.
2. **Small Test Partition:** The held-out test set contains 35 samples (8 positive cases, 27 negative cases). While a 75.0% recall rate (6/8 detected) is encouraging, the confidence interval is broad due to the small sample count.
3. **Self-Report Recall Bias:** Dietary and lifestyle variables rely on subjective user recall (e.g., estimating frequency of consumption over a typical week).
4. **Lack of Biochemical & Imaging Markers:** The tabular model relies strictly on patient-reportable symptoms and lifestyle factors. It does not incorporate laboratory assays (serum testosterone, AMH, LH/FSH) or pelvic ultrasound morphology.
5. **No Regulatory Clearance:** PCOSense is an educational software prototype. It has not undergone clinical trials, FDA 510(k) clearance, or CE-MDR certification.

---

## Future Improvements

- **Multimodal Pelvic Ultrasound Analysis:** Incorporate computer vision (e.g., U-Net or YOLO) to detect antral follicles and ovarian volume from ultrasound imaging, combining imaging features with tabular questionnaire data.
- **External Dataset Validation:** Validate and calibrate the model against larger, open clinical PCOS cohorts to improve probability reliability across diverse populations.
- **Model Interpretability Integration:** Integrate TreeSHAP into the prediction endpoint to show patient-specific feature contribution waterfalls alongside clinical rule indicators.
- **Containerization & Deployment:** Add a multi-stage `Dockerfile` and `docker-compose.yml` configuration for single-command containerized deployment to cloud platforms.

---

## Disclaimer

**PCOSense is not a medical diagnostic device.**

The risk scores and assessments generated by this application are statistical estimates intended strictly for educational and early self-awareness screening purposes. They do not constitute a medical diagnosis, clinical prognosis, or treatment recommendation. 

Individuals experiencing menstrual irregularities, abnormal hair growth, metabolic symptoms, or fertility concerns should consult a qualified healthcare provider, gynecologist, or endocrinologist for comprehensive clinical evaluation, diagnostic hormone blood tests, and pelvic ultrasound imaging.

---

## License & Attribution

- **Software Code:** Released under the [MIT License](LICENSE).
- **Dataset Attribution:** The survey dataset used to train the baseline model originates from the research dataset [*"Diet, Exercise, and PCOS Insights"*](https://www.kaggle.com/datasets/hasaanrana/diet-exercise-and-pcos-insights) by Hasaan Rana on Kaggle. The dataset is not distributed in this repository.
- **Clinical Guidelines Notice:** Rotterdam consensus criteria referenced belong to the European Society of Human Reproduction and Embryology (ESHRE) and the American Society for Reproductive Medicine (ASRM).
