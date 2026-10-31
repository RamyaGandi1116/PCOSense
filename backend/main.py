"""
FastAPI Backend for PCOSense
Integrates the trained Scikit-learn Pipeline saved in models/pcos_prediction_model.pkl
"""

import os
import json
import logging
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("pcos-api")

# File paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "pcos_prediction_model.pkl")
SCHEMA_PATH = os.path.join(BASE_DIR, "models", "frontend_input_schema.json")
METADATA_PATH = os.path.join(BASE_DIR, "models", "model_metadata.json")

# In-memory storage for model and metadata loaded at startup
ml_assets: Dict[str, Any] = {
    "model": None,
    "schema": None,
    "metadata": None,
    "feature_names": None,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load machine learning model and schema once at server startup."""
    logger.info("Initializing PCOSense Backend...")

    # Load Model Pipeline
    if not os.path.exists(MODEL_PATH):
        logger.error(f"Model file not found at: {MODEL_PATH}")
        raise RuntimeError(f"Trained model artifact missing at {MODEL_PATH}")
    
    try:
        ml_assets["model"] = joblib.load(MODEL_PATH)
        logger.info(f"Successfully loaded model pipeline from {MODEL_PATH}")
    except Exception as e:
        logger.error(f"Failed to load model pipeline: {e}")
        raise RuntimeError(f"Error loading model: {e}")

    # Load Schema
    if os.path.exists(SCHEMA_PATH):
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            ml_assets["schema"] = json.load(f)
        logger.info("Loaded frontend input schema.")
    else:
        logger.warning(f"Schema file not found at {SCHEMA_PATH}")

    # Load Metadata
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            ml_assets["metadata"] = json.load(f)
            ml_assets["feature_names"] = ml_assets["metadata"]["features"]["all_input_features"]
        logger.info(f"Loaded metadata. Expected features count: {len(ml_assets['feature_names'])}")
    else:
        # Fallback feature list from training specification
        ml_assets["feature_names"] = [
            'Age', 'Weight_kg', 'Height_ft', 'Marital_Status', 'Family_History_PCOS',
            'Menstrual_Irregularity', 'Hirsutism', 'Mental_Health', 'Diabetes',
            'Childhood_Trauma', 'Cardiovascular_Disease', 'Diet_Bread_Cereals',
            'Diet_Milk_Products', 'Diet_Fruits', 'Diet_Vegetables', 'Diet_Starchy_Vegetables',
            'Diet_NonStarchy_Vegetables', 'Diet_Fats', 'Diet_Sweets', 'Diet_Fried_Food',
            'Diet_Tea_Coffee', 'Diet_Multivitamin', 'Vegetarian', 'Exercise_Frequency',
            'Exercise_Type', 'Exercise_Duration', 'Sleep_Hours', 'Stress_Level',
            'Smoking', 'BMI'
        ]

    yield

    logger.info("Shutting down PCOSense Backend...")
    ml_assets.clear()


app = FastAPI(
    title="PCOSense API",
    description="REST API providing AI-assisted risk screening decision support for Polycystic Ovary Syndrome (PCOS).",
    version="1.0.0",
    lifespan=lifespan
)

# Enable Cross-Origin Resource Sharing (CORS) for web frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Request Model with Validation Constraints
class ScreeningInput(BaseModel):
    # Demographics & Anthropometrics
    Age: str = Field(..., description="Age group category")
    Weight_kg: float = Field(..., ge=25.0, le=200.0, description="Weight in kilograms")
    Height_ft: float = Field(..., ge=100.0, le=220.0, description="Height in centimeters (stored as Height_ft in dataset)")
    Marital_Status: str = Field(..., description="Marital status")

    # Medical & Family History
    Family_History_PCOS: str = Field(..., description="Family history of PCOS ('Yes'/'No')")
    Diabetes: str = Field(..., description="Prior diabetes diagnosis ('Yes'/'No')")
    Cardiovascular_Disease: str = Field(..., description="Prior cardiovascular disease ('Yes'/'No')")
    Childhood_Trauma: str = Field(..., description="Reported history of childhood trauma ('Yes'/'No')")

    # Observable Symptoms & Mental Health
    Menstrual_Irregularity: str = Field(..., description="Irregular or absent menstrual cycles ('Yes'/'No')")
    Hirsutism: str = Field(..., description="Excessive or abnormal body/facial hair ('Yes'/'No')")
    Mental_Health: str = Field(..., description="History of depression, anxiety, or mental health concerns ('Yes'/'No')")

    # Lifestyle & Physical Activity
    Vegetarian: str = Field(..., description="Vegetarian diet ('Yes'/'No')")
    Exercise_Frequency: str = Field(..., description="Frequency of exercise")
    Exercise_Type: str = Field(..., description="Type of exercise performed")
    Exercise_Duration: str = Field(..., description="Typical duration of exercise")
    Sleep_Hours: str = Field(..., description="Average daily sleep hours")
    Stress_Level: str = Field(..., description="Subjective elevated stress levels ('Yes'/'No')")
    Smoking: str = Field(..., description="Smoking history ('Yes'/'No')")

    # Dietary Frequencies (Days per week: 0 to 7)
    Diet_Bread_Cereals: int = Field(..., ge=0, le=7, description="Bread & cereals frequency")
    Diet_Milk_Products: int = Field(..., ge=0, le=7, description="Dairy/milk products frequency")
    Diet_Fruits: int = Field(..., ge=0, le=7, description="Fresh fruits frequency")
    Diet_Vegetables: int = Field(..., ge=0, le=7, description="Vegetables frequency")
    Diet_Starchy_Vegetables: int = Field(..., ge=0, le=7, description="Starchy vegetables frequency")
    Diet_NonStarchy_Vegetables: int = Field(..., ge=0, le=7, description="Non-starchy vegetables frequency")
    Diet_Fats: int = Field(..., ge=0, le=7, description="Dietary fats frequency")
    Diet_Sweets: int = Field(..., ge=0, le=7, description="Sweets and desserts frequency")
    Diet_Fried_Food: int = Field(..., ge=0, le=7, description="Fried foods frequency")
    Diet_Tea_Coffee: int = Field(..., ge=0, le=7, description="Tea / coffee consumption frequency")
    Diet_Multivitamin: int = Field(..., ge=0, le=7, description="Multivitamin supplementation frequency")

    # Optional pre-computed BMI; calculated automatically if not supplied
    BMI: Optional[float] = Field(None, description="Body Mass Index (kg/m²)")

    @field_validator("Age")
    @classmethod
    def validate_age(cls, v: str) -> str:
        valid = ["Less than 20", "20-25", "25-30", "30-35", "35-44", "45 and above"]
        if v not in valid:
            raise ValueError(f"Invalid Age category '{v}'. Must be one of: {valid}")
        return v

    @field_validator("Marital_Status")
    @classmethod
    def validate_marital(cls, v: str) -> str:
        valid = ["Unmarried", "Married", "Widow"]
        if v not in valid:
            raise ValueError(f"Invalid Marital_Status '{v}'. Must be one of: {valid}")
        return v

    @field_validator("Family_History_PCOS", "Diabetes", "Cardiovascular_Disease",
                     "Childhood_Trauma", "Menstrual_Irregularity", "Hirsutism",
                     "Mental_Health", "Vegetarian", "Stress_Level", "Smoking")
    @classmethod
    def validate_binary_fields(cls, v: str) -> str:
        if v not in ["No", "Yes"]:
            raise ValueError("Value must be 'No' or 'Yes'.")
        return v

    @field_validator("Exercise_Frequency")
    @classmethod
    def validate_exercise_freq(cls, v: str) -> str:
        valid = ["Never", "Rarely", "1-2 Times a Week", "3-4 Times a Week", "Daily"]
        if v not in valid:
            raise ValueError(f"Invalid Exercise_Frequency '{v}'. Must be one of: {valid}")
        return v

    @field_validator("Sleep_Hours")
    @classmethod
    def validate_sleep(cls, v: str) -> str:
        valid = ["Less than 6 hours", "6-8 hours", "9-12 hours", "More than 12 hours"]
        if v not in valid:
            raise ValueError(f"Invalid Sleep_Hours '{v}'. Must be one of: {valid}")
        return v


class FactorImpact(BaseModel):
    factor: str
    status: str
    impact: str
    description: str


class ScreeningResponse(BaseModel):
    prediction: str = Field(..., description="Binary classification outcome: 'No' or 'Yes'")
    risk_probability: float = Field(..., description="Probability of PCOS risk between 0.0 and 1.0")
    risk_percentage: float = Field(..., description="Risk probability expressed as a percentage")
    risk_level: str = Field(..., description="Categorical risk stratification: 'Lower Risk' or 'Higher Risk'")
    bmi: float = Field(..., description="Calculated Body Mass Index (kg/m²)")
    bmi_category: str = Field(..., description="Standard WHO BMI classification")
    contributing_factors: List[FactorImpact] = Field(..., description="Relevant reported clinical indicators providing screening context based on clinical consensus criteria")
    recommendations: List[str] = Field(..., description="Neutral clinical guidance based on result")
    disclaimer: str = Field(..., description="Mandatory medical and regulatory disclaimer")


def determine_bmi_category(bmi: float) -> str:
    """Return WHO BMI classification."""
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25.0:
        return "Normal weight"
    elif bmi < 30.0:
        return "Overweight"
    else:
        return "Obese"


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint for status check and API metadata."""
    return {
        "service": "PCOSense Backend API",
        "status": "online",
        "version": "1.0.0",
        "model_loaded": ml_assets["model"] is not None,
        "docs_url": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    if ml_assets["model"] is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model pipeline is not currently loaded."
        )
    return {
        "status": "healthy",
        "model": "RandomForestClassifier (Regularized)",
        "features_count": len(ml_assets["feature_names"])
    }


@app.get("/schema", tags=["Metadata"])
async def get_schema():
    """Retrieve the official frontend input schema."""
    if ml_assets["schema"] is not None:
        return ml_assets["schema"]
    if os.path.exists(SCHEMA_PATH):
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Input schema file not found.")


@app.get("/model-info", tags=["Metadata"])
async def get_model_info():
    """Retrieve model metadata, evaluation metrics, and feature importance highlights."""
    if ml_assets["metadata"] is not None:
        return ml_assets["metadata"]
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Model metadata not found.")


@app.post("/predict", response_model=ScreeningResponse, tags=["Inference"])
async def predict_risk(payload: ScreeningInput):
    """
    Execute PCOSense risk screening inference using the loaded Scikit-learn Pipeline.
    Converts input into a pandas DataFrame matching exact training feature names and order.
    """
    model = ml_assets.get("model")
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The predictive pipeline is unavailable. Please check server logs."
        )

    try:
        # Convert Pydantic payload to dictionary
        data_dict = payload.model_dump()

        # Compute BMI if not provided or to ensure strict physiological consistency
        computed_bmi = round(data_dict["Weight_kg"] / ((data_dict["Height_ft"] / 100.0) ** 2), 2)
        data_dict["BMI"] = computed_bmi

        # Build DataFrame with exact expected feature names and order
        expected_features = ml_assets["feature_names"]
        input_df = pd.DataFrame([data_dict])[expected_features]

        logger.info(f"Running inference for profile with BMI={computed_bmi}, Cycle={data_dict.get('Menstrual_Irregularity')}, Hirsutism={data_dict.get('Hirsutism')}")

        # Model Inference
        raw_pred = model.predict(input_df)[0]
        probabilities = model.predict_proba(input_df)[0]

        # Extract probability for positive class ('Yes')
        # In our classifier, classes are ['No', 'Yes']
        prob_yes = float(probabilities[1])
        prob_percentage = round(prob_yes * 100.0, 1)

        # Risk Stratification Label
        risk_level = "Higher Risk" if raw_pred == "Yes" or prob_yes >= 0.50 else "Lower Risk"
        bmi_cat = determine_bmi_category(computed_bmi)

        # Identify relevant reported indicators based on patient questionnaire responses (clinical context)
        contributing_factors: List[FactorImpact] = []

        if data_dict.get("Menstrual_Irregularity") == "Yes":
            contributing_factors.append(FactorImpact(
                factor="Menstrual Cycle Irregularity",
                status="Reported",
                impact="Strongest clinical hallmark",
                description="Chronic anovulation or irregular cycles is one of the cardinal diagnostic criteria for PCOS."
            ))
        else:
            contributing_factors.append(FactorImpact(
                factor="Menstrual Cycle Regularity",
                status="Regular",
                impact="Favorable indicator",
                description="Regular ovulatory cycles substantially reduce statistical likelihood of classical PCOS."
            ))

        if data_dict.get("Hirsutism") == "Yes":
            contributing_factors.append(FactorImpact(
                factor="Hirsutism (Excess Body/Facial Hair)",
                status="Reported",
                impact="Clinical hyperandrogenism flag",
                description="Excessive androgen-dependent hair growth is a prominent clinical indicator evaluated by the model."
            ))

        if computed_bmi >= 25.0:
            contributing_factors.append(FactorImpact(
                factor="Body Mass Index (BMI)",
                status=f"{computed_bmi} kg/m² ({bmi_cat})",
                impact="Metabolic risk indicator",
                description="Elevated adiposity strongly correlates with insulin resistance and ovulatory dysfunction in PCOS cohorts."
            ))
        else:
            contributing_factors.append(FactorImpact(
                factor="Body Mass Index (BMI)",
                status=f"{computed_bmi} kg/m² ({bmi_cat})",
                impact="Normal metabolic range",
                description="BMI is within normal parameters, though lean PCOS phenotypic variants remain possible."
            ))

        if data_dict.get("Family_History_PCOS") == "Yes":
            contributing_factors.append(FactorImpact(
                factor="Family History of PCOS",
                status="Present",
                impact="Genetic predisposition",
                description="PCOS exhibits significant familial aggregation and heritable endocrine risk."
            ))

        if data_dict.get("Stress_Level") == "Yes":
            contributing_factors.append(FactorImpact(
                factor="Elevated Stress",
                status="Reported",
                impact="Secondary lifestyle factor",
                description="Hypothalamic-pituitary-adrenal axis disruption is frequently comorbid with endocrine imbalance."
            ))

        # Tailored neutral recommendations
        if risk_level == "Higher Risk":
            recommendations = [
                "Schedule a comprehensive consultation with a gynecologist or reproductive endocrinologist.",
                "Discuss your symptom history, specifically menstrual cycle patterns and any hyperandrogenic signs.",
                "A formal clinical workup typically includes pelvic ultrasound (assessing ovarian morphology) and serum hormone testing (LH/FSH, free testosterone, DHEA-S).",
                "Maintain a balanced dietary pattern and consistent physical activity to support metabolic health."
            ]
        else:
            recommendations = [
                "A lower model-estimated risk does not definitively rule out PCOS or other hormonal conditions.",
                "If you experience persistent cycle irregularity, acne, or unexplained metabolic changes, seek a clinical evaluation.",
                "Continue supporting ovulatory and metabolic health through balanced nutrition, sleep hygiene, and active lifestyle habits."
            ]

        disclaimer_text = (
            "This result is an AI-assisted statistical screening estimate derived from a questionnaire-based "
            "machine learning model. It is intended strictly for preliminary risk stratification and educational "
            "purposes. It does NOT constitute a clinical diagnosis or medical confirmation. Please consult a qualified "
            "healthcare provider for personalized medical evaluation."
        )

        return ScreeningResponse(
            prediction=str(raw_pred),
            risk_probability=round(prob_yes, 4),
            risk_percentage=prob_percentage,
            risk_level=risk_level,
            bmi=computed_bmi,
            bmi_category=bmi_cat,
            contributing_factors=contributing_factors,
            recommendations=recommendations,
            disclaimer=disclaimer_text
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction inference error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing the screening prediction. Please verify your inputs and try again."
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
