"""
Unit and integration tests for FastAPI PCOSense Backend
"""

import os
import sys
import unittest
from fastapi.testclient import TestClient

# Ensure root directory is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.main import app

class TestPCOSBackend(unittest.TestCase):

    def test_01_root_endpoint(self):
        with TestClient(app) as client:
            response = client.get("/")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["status"], "online")
            self.assertTrue(data["model_loaded"])

    def test_02_health_endpoint(self):
        with TestClient(app) as client:
            response = client.get("/health")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["status"], "healthy")
            self.assertEqual(data["features_count"], 30)

    def test_03_schema_endpoint(self):
        with TestClient(app) as client:
            response = client.get("/schema")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("features", data)
            self.assertEqual(len(data["features"]), 30)

    def test_04_model_info_endpoint(self):
        with TestClient(app) as client:
            response = client.get("/model-info")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["model_name"], "PCOS_Risk_Prediction_Pipeline")
            self.assertIn("test_metrics", data)
            self.assertAlmostEqual(data["test_metrics"]["roc_auc"], 0.8472, places=3)

    def test_05_predict_higher_risk(self):
        payload = {
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
        with TestClient(app) as client:
            response = client.post("/predict", json=payload)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            print("\n[TEST] High Risk Response:", data["prediction"], data["risk_percentage"], "%", data["risk_level"])
            self.assertEqual(data["prediction"], "Yes")
            self.assertEqual(data["risk_level"], "Higher Risk")
            self.assertGreater(data["risk_probability"], 0.70)
            self.assertAlmostEqual(data["bmi"], 31.45, places=1)
            self.assertEqual(data["bmi_category"], "Obese")

    def test_06_predict_lower_risk(self):
        payload = {
            "Age": "20-25",
            "Weight_kg": 52.0,
            "Height_ft": 165.10,
            "Marital_Status": "Unmarried",
            "Family_History_PCOS": "No",
            "Menstrual_Irregularity": "No",
            "Hirsutism": "No",
            "Mental_Health": "No",
            "Diabetes": "No",
            "Childhood_Trauma": "No",
            "Cardiovascular_Disease": "No",
            "Diet_Bread_Cereals": 2,
            "Diet_Milk_Products": 3,
            "Diet_Fruits": 6,
            "Diet_Vegetables": 6,
            "Diet_Starchy_Vegetables": 2,
            "Diet_NonStarchy_Vegetables": 5,
            "Diet_Fats": 2,
            "Diet_Sweets": 1,
            "Diet_Fried_Food": 1,
            "Diet_Tea_Coffee": 2,
            "Diet_Multivitamin": 4,
            "Vegetarian": "No",
            "Exercise_Frequency": "3-4 Times a Week",
            "Exercise_Type": "Cardio (e.g., running, cycling, swimming)",
            "Exercise_Duration": "30 minutes to 1 hour",
            "Sleep_Hours": "6-8 hours",
            "Stress_Level": "No",
            "Smoking": "No"
        }
        with TestClient(app) as client:
            response = client.post("/predict", json=payload)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            print("\n[TEST] Low Risk Response:", data["prediction"], data["risk_percentage"], "%", data["risk_level"])
            self.assertEqual(data["prediction"], "No")
            self.assertEqual(data["risk_level"], "Lower Risk")
            self.assertLess(data["risk_probability"], 0.40)
            self.assertAlmostEqual(data["bmi"], 19.08, places=1)
            self.assertEqual(data["bmi_category"], "Normal weight")

    def test_07_invalid_input(self):
        # Invalid payload: missing fields and invalid Diet_Sweets range (99)
        invalid_payload = {
            "Age": "Invalid Age",
            "Weight_kg": -10.0,
            "Diet_Sweets": 99
        }
        with TestClient(app) as client:
            response = client.post("/predict", json=invalid_payload)
            self.assertEqual(response.status_code, 422) # Unprocessable Entity
            print("\n[TEST] Invalid input properly rejected with 422.")


if __name__ == "__main__":
    unittest.main()
