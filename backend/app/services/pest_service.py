"""
Computer Vision Foliar Pathology & Pest Diagnostics Service
AGRISENSE Platform
"""

import io
import json
from pathlib import Path
from typing import Any, Dict
import joblib
import numpy as np
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
SAVED_MODELS_DIR = BASE_DIR / "ml" / "saved_models"
MODEL_PATH = SAVED_MODELS_DIR / "pest_classifier.joblib"
METADATA_PATH = SAVED_MODELS_DIR / "pest_metadata.json"

class PestDetectionService:
    def __init__(self):
        self.model = None
        self.metadata = None
        self._load_model()

    def _load_model(self):
        if MODEL_PATH.exists() and METADATA_PATH.exists():
            self.model = joblib.load(MODEL_PATH)
            with open(METADATA_PATH, "r") as f:
                self.metadata = json.load(f)
            print("[PestDetectionService] Foliar Pathology Classifier loaded successfully.")
        else:
            print("[PestDetectionService] Pest model artifacts not found on disk.")

    def extract_features(self, image_bytes: bytes) -> tuple[np.ndarray, Dict[str, float]]:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_resized = img.resize((128, 128))
        arr = np.array(img_resized, dtype=np.float32) / 255.0

        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        mean_r = float(np.mean(r))
        mean_g = float(np.mean(g))
        mean_b = float(np.mean(b))

        # Detect necrotic/brown lesion pixels
        necrotic_mask = (r > (b + 0.08)) & (r > 0.30) & (g < 0.60) & (g > 0.15)
        brown_ratio = float(np.mean(necrotic_mask))

        # Detect healthy green vegetative pixels
        green_mask = (g > (r + 0.04)) & (g > (b + 0.04))
        green_ratio = float(np.mean(green_mask))

        # High-frequency edge gradient (lesions, pustules, leaf spots)
        diff_h = np.abs(arr[1:, :, :] - arr[:-1, :, :])
        diff_v = np.abs(arr[:, 1:, :] - arr[:, :-1, :])
        edge_density = float((np.mean(diff_h) + np.mean(diff_v)) / 2.0)

        color_std = float(np.std(arr))
        excess_green = float(np.mean((2.0 * g - r - b) / (2.0 * g + r + b + 1e-5)))

        features = [
            mean_r, mean_g, mean_b,
            brown_ratio, green_ratio,
            edge_density, color_std, excess_green
        ]

        metrics = {
            "mean_red": round(mean_r, 3),
            "mean_green": round(mean_g, 3),
            "mean_blue": round(mean_b, 3),
            "necrotic_tissue_ratio": round(brown_ratio * 100, 1),
            "healthy_canopy_ratio": round(green_ratio * 100, 1),
            "lesion_edge_density": round(edge_density * 100, 1),
            "canopy_heterogeneity": round(color_std * 100, 1),
            "vegetative_index": round(excess_green, 3)
        }

        return np.array([features], dtype=np.float32), metrics

    def diagnose_image(self, image_bytes: bytes) -> Dict[str, Any]:
        if self.model is None:
            self._load_model()
            if self.model is None:
                raise RuntimeError("Pest detection model is not loaded.")

        X, metrics = self.extract_features(image_bytes)
        probs = self.model.predict_proba(X)[0]
        classes = self.model.classes_

        best_idx = int(np.argmax(probs))
        predicted_class = classes[best_idx]
        confidence = float(probs[best_idx])

        # Retrieve disease profile
        profiles = self.metadata.get("disease_profiles", {})
        disease_info = profiles.get(predicted_class, {
            "crop": "Field Crop",
            "disease_name": predicted_class.replace("_", " "),
            "pathogen": "Foliar Pathogen",
            "severity": "Moderate",
            "symptoms": ["Visible foliar discoloration and spot formation"],
            "causes": ["High humidity and surface moisture"],
            "preventive_measures": ["Improve canopy aeration and crop spacing"],
            "treatment_guidance": ["Consult local agricultural extension for registered fungicides."]
        })

        return {
            "crop_name": disease_info["crop"],
            "disease_name": disease_info["disease_name"],
            "pathogen": disease_info["pathogen"],
            "severity": disease_info["severity"],
            "confidence": round(confidence * 100.0, 1),
            "symptoms": disease_info["symptoms"],
            "causes": disease_info["causes"],
            "preventive_measures": disease_info["preventive_measures"],
            "treatment_guidance": disease_info["treatment_guidance"],
            "analyzed_features": metrics
        }

pest_service = PestDetectionService()
