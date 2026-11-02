"""
AGRISENSE ML Inference and Agronomic Explainability Engine
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import joblib
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
SAVED_MODELS_DIR = BASE_DIR / "saved_models"

# Load serialized artifacts
MODEL_PATH = SAVED_MODELS_DIR / "crop_recommendation_best.joblib"
SCALER_PATH = SAVED_MODELS_DIR / "scaler.joblib"
ENCODER_PATH = SAVED_MODELS_DIR / "label_encoder.joblib"
METADATA_PATH = SAVED_MODELS_DIR / "model_metadata.json"

# Detailed Agronomic Reference Database for 22 Crops (ICAR & Directorate of Economics and Statistics)
CROP_AGRONOMIC_KNOWLEDGE = {
    "rice": {
        "display_name": "Rice (Paddy)",
        "category": "Cereal / Staple",
        "optimal_ranges": {"N": [60, 100], "P": [35, 60], "K": [35, 60], "temp": [20, 32], "humidity": [70, 92], "ph": [5.5, 7.2], "rainfall": [150, 300], "moisture": [65, 85]},
        "preferred_soil": ["clayey", "alluvial", "clay loam", "loam"],
        "season": "Kharif",
        "duration_days": 135,
        "base_yield_quintal_acre": 22.5,
        "market_price_quintal": 2250,
        "cost_per_acre": 24000,
        "fertilizer_advice": "Apply Urea in 3 splits (basal, tillering, panicle initiation). Supplement with Zinc Sulfate (25 kg/ha).",
        "irrigation_advice": "Maintain 2-5 cm standing water during vegetative phase; drain field 10 days prior to harvest."
    },
    "maize": {
        "display_name": "Maize (Corn)",
        "category": "Cereal / Feed",
        "optimal_ranges": {"N": [60, 110], "P": [40, 65], "K": [30, 55], "temp": [18, 30], "humidity": [55, 75], "ph": [5.8, 7.5], "rainfall": [60, 110], "moisture": [45, 65]},
        "preferred_soil": ["loam", "alluvial", "sandy loam", "red loam"],
        "season": "Kharif / Rabi",
        "duration_days": 105,
        "base_yield_quintal_acre": 28.0,
        "market_price_quintal": 2090,
        "cost_per_acre": 19500,
        "fertilizer_advice": "Basal application of NPK 120:60:40 kg/ha. Top dress nitrogen at knee-high and tasseling stages.",
        "irrigation_advice": "Critical irrigation stages are tasseling and silking. Avoid waterlogging at seedling stage."
    },
    "chickpea": {
        "display_name": "Chickpea (Gram)",
        "category": "Pulse / Legume",
        "optimal_ranges": {"N": [20, 50], "P": [55, 80], "K": [75, 95], "temp": [15, 25], "humidity": [35, 60], "ph": [6.0, 7.8], "rainfall": [40, 90], "moisture": [30, 50]},
        "preferred_soil": ["sandy loam", "clay loam", "loam", "black"],
        "season": "Rabi",
        "duration_days": 115,
        "base_yield_quintal_acre": 9.5,
        "market_price_quintal": 5440,
        "cost_per_acre": 14000,
        "fertilizer_advice": "Seed inoculation with Rhizobium culture. Apply Phosphorus (DAP) at 40 kg P2O5/ha. Low N required due to biological fixation.",
        "irrigation_advice": "Needs light irrigation at branching and pod development. Excess moisture causes root rot."
    },
    "kidneybeans": {
        "display_name": "Kidney Beans (Rajma)",
        "category": "Pulse / Legume",
        "optimal_ranges": {"N": [15, 40], "P": [55, 75], "K": [20, 45], "temp": [15, 24], "humidity": [50, 65], "ph": [5.5, 6.5], "rainfall": [60, 120], "moisture": [40, 60]},
        "preferred_soil": ["loam", "rich organic loam", "sandy loam"],
        "season": "Rabi / Kharif (Hills)",
        "duration_days": 100,
        "base_yield_quintal_acre": 8.0,
        "market_price_quintal": 8200,
        "cost_per_acre": 18000,
        "fertilizer_advice": "Requires 100 kg N/ha since nodulation is poor. Apply full P and K as basal dressing.",
        "irrigation_advice": "Sensitive to water stress at flowering and pod filling. Keep soil uniformly moist."
    },
    "pigeonpeas": {
        "display_name": "Pigeonpeas (Arhar / Tur)",
        "category": "Pulse / Legume",
        "optimal_ranges": {"N": [15, 40], "P": [60, 80], "K": [20, 45], "temp": [22, 35], "humidity": [45, 70], "ph": [6.5, 7.8], "rainfall": [90, 160], "moisture": [35, 55]},
        "preferred_soil": ["alluvial", "loam", "black", "red loam"],
        "season": "Kharif",
        "duration_days": 170,
        "base_yield_quintal_acre": 8.5,
        "market_price_quintal": 7000,
        "cost_per_acre": 16000,
        "fertilizer_advice": "Apply 25 kg N and 50 kg P2O5 per hectare at sowing. Inoculate with Rhizobium.",
        "irrigation_advice": "Drought-hardy deep root system. Provide life-saving irrigation at flower initiation if dry."
    },
    "mothbeans": {
        "display_name": "Moth Beans",
        "category": "Pulse (Arid)",
        "optimal_ranges": {"N": [15, 35], "P": [40, 60], "K": [15, 30], "temp": [25, 36], "humidity": [35, 65], "ph": [6.0, 7.8], "rainfall": [30, 75], "moisture": [20, 40]},
        "preferred_soil": ["sandy", "sandy loam", "light loam"],
        "season": "Kharif",
        "duration_days": 80,
        "base_yield_quintal_acre": 5.0,
        "market_price_quintal": 6800,
        "cost_per_acre": 10500,
        "fertilizer_advice": "Light application of 15 kg N and 40 kg P2O5/ha. Excellent for arid green manuring.",
        "irrigation_advice": "Extreme drought tolerance; thrives primarily on residual monsoon rainfall."
    },
    "mungbean": {
        "display_name": "Mung Bean (Green Gram)",
        "category": "Pulse / Legume",
        "optimal_ranges": {"N": [15, 35], "P": [40, 60], "K": [15, 35], "temp": [25, 34], "humidity": [50, 75], "ph": [6.2, 7.5], "rainfall": [40, 80], "moisture": [30, 50]},
        "preferred_soil": ["loam", "alluvial", "sandy loam"],
        "season": "Kharif / Zaid",
        "duration_days": 70,
        "base_yield_quintal_acre": 6.5,
        "market_price_quintal": 7800,
        "cost_per_acre": 12500,
        "fertilizer_advice": "Apply 20 kg N and 40 kg P2O5 as basal. Spray 2% DAP at flower onset.",
        "irrigation_advice": "Provide 3 irrigations: branching, flowering, and early pod maturity."
    },
    "blackgram": {
        "display_name": "Black Gram (Urad)",
        "category": "Pulse / Legume",
        "optimal_ranges": {"N": [30, 55], "P": [55, 75], "K": [20, 40], "temp": [25, 35], "humidity": [60, 75], "ph": [6.0, 7.5], "rainfall": [60, 95], "moisture": [35, 55]},
        "preferred_soil": ["loam", "black", "alluvial"],
        "season": "Kharif / Rabi",
        "duration_days": 85,
        "base_yield_quintal_acre": 6.8,
        "market_price_quintal": 7400,
        "cost_per_acre": 13000,
        "fertilizer_advice": "Apply 20 kg N and 40 kg P2O5 per ha. Use sulfur-containing fertilizers.",
        "irrigation_advice": "Irrigate at pre-flowering and pod filling stages. Avoid excessive irrigation."
    },
    "lentil": {
        "display_name": "Lentil (Masoor)",
        "category": "Pulse / Legume",
        "optimal_ranges": {"N": [15, 35], "P": [55, 75], "K": [15, 30], "temp": [15, 25], "humidity": [45, 65], "ph": [5.8, 7.5], "rainfall": [35, 65], "moisture": [30, 50]},
        "preferred_soil": ["loam", "clay loam", "alluvial"],
        "season": "Rabi",
        "duration_days": 125,
        "base_yield_quintal_acre": 7.5,
        "market_price_quintal": 6400,
        "cost_per_acre": 12000,
        "fertilizer_advice": "Apply 20 kg N and 40 kg P2O5 per ha as basal. Zinc spray (0.5%) if deficient.",
        "irrigation_advice": "One irrigation at 40-45 days after sowing and one at pod formation."
    },
    "pomegranate": {
        "display_name": "Pomegranate",
        "category": "Horticultural / Fruit",
        "optimal_ranges": {"N": [15, 35], "P": [15, 35], "K": [35, 50], "temp": [22, 34], "humidity": [35, 60], "ph": [6.5, 7.8], "rainfall": [40, 70], "moisture": [35, 55]},
        "preferred_soil": ["loam", "sandy loam", "gravelly alluvial"],
        "season": "Perennial / Whole Year",
        "duration_days": 210,
        "base_yield_quintal_acre": 35.0,
        "market_price_quintal": 9500,
        "cost_per_acre": 55000,
        "fertilizer_advice": "Per mature tree: 625g N, 250g P2O5, and 250g K2O. Organic farmyard manure (20kg/tree).",
        "irrigation_advice": "Drip irrigation essential. Regulate irrigation for synchronized flowering (Bahar treatment)."
    },
    "banana": {
        "display_name": "Banana",
        "category": "Horticultural / Fruit",
        "optimal_ranges": {"N": [85, 120], "P": [70, 95], "K": [45, 60], "temp": [24, 33], "humidity": [75, 90], "ph": [6.0, 7.5], "rainfall": [90, 150], "moisture": [65, 85]},
        "preferred_soil": ["clay loam", "alluvial", "rich loam"],
        "season": "Perennial / Whole Year",
        "duration_days": 330,
        "base_yield_quintal_acre": 180.0,
        "market_price_quintal": 1850,
        "cost_per_acre": 65000,
        "fertilizer_advice": "Heavy feeder. Apply 200g N, 60g P, 300g K per plant via fertigation schedule.",
        "irrigation_advice": "Requires continuous high moisture (15-20 mm every 3-4 days in summer). Drip recommended."
    },
    "mango": {
        "display_name": "Mango",
        "category": "Horticultural / Orchard",
        "optimal_ranges": {"N": [15, 35], "P": [15, 35], "K": [25, 45], "temp": [24, 36], "humidity": [45, 65], "ph": [5.5, 7.5], "rainfall": [70, 120], "moisture": [40, 60]},
        "preferred_soil": ["alluvial", "loam", "deep red loam"],
        "season": "Perennial / Whole Year",
        "duration_days": 180,
        "base_yield_quintal_acre": 45.0,
        "market_price_quintal": 4800,
        "cost_per_acre": 42000,
        "fertilizer_advice": "Apply 1 kg N, 0.5 kg P, 1 kg K per mature tree in July-August after harvest.",
        "irrigation_advice": "Withhold water 2-3 months prior to flowering. Resume frequent irrigation during fruit development."
    },
    "grapes": {
        "display_name": "Grapes (Viticulture)",
        "category": "Horticultural / Vineyard",
        "optimal_ranges": {"N": [15, 35], "P": [120, 145], "K": [195, 210], "temp": [15, 32], "humidity": [45, 75], "ph": [6.0, 7.5], "rainfall": [60, 90], "moisture": [35, 55]},
        "preferred_soil": ["sandy loam", "gravelly loam", "red sandy loam"],
        "season": "Perennial / Whole Year",
        "duration_days": 150,
        "base_yield_quintal_acre": 70.0,
        "market_price_quintal": 6200,
        "cost_per_acre": 85000,
        "fertilizer_advice": "High potash and phosphorus requirements. Use Potassium Nitrate and Calcium Nitrate foliar sprays.",
        "irrigation_advice": "Drip irrigation timed with pruning cycles. Stop irrigation 10 days before harvest for brix development."
    },
    "watermelon": {
        "display_name": "Watermelon",
        "category": "Horticultural / Cucurbit",
        "optimal_ranges": {"N": [80, 110], "P": [15, 30], "K": [45, 60], "temp": [24, 35], "humidity": [75, 90], "ph": [6.0, 7.2], "rainfall": [40, 70], "moisture": [40, 60]},
        "preferred_soil": ["sandy", "sandy loam", "alluvial"],
        "season": "Zaid (Summer)",
        "duration_days": 90,
        "base_yield_quintal_acre": 90.0,
        "market_price_quintal": 1300,
        "cost_per_acre": 28000,
        "fertilizer_advice": "Apply 100 kg N, 50 kg P2O5, 50 kg K2O/ha. Micronutrient sprays (Boron) to prevent fruit cracking.",
        "irrigation_advice": "Irrigate every 4-6 days on sandy soils. Reduce water during ripening to boost sugar content."
    },
    "muskmelon": {
        "display_name": "Muskmelon (Cantaloupe)",
        "category": "Horticultural / Cucurbit",
        "optimal_ranges": {"N": [80, 110], "P": [15, 30], "K": [45, 60], "temp": [25, 35], "humidity": [85, 95], "ph": [6.0, 7.0], "rainfall": [20, 45], "moisture": [35, 55]},
        "preferred_soil": ["sandy loam", "sandy", "loam"],
        "season": "Zaid (Summer)",
        "duration_days": 85,
        "base_yield_quintal_acre": 75.0,
        "market_price_quintal": 1650,
        "cost_per_acre": 26000,
        "fertilizer_advice": "Apply NPK 80:50:50. Supplement with soluble Calcium and Potassium during fruit swell.",
        "irrigation_advice": "Trickle irrigation under silver-black plastic mulch produces superior grade fruit."
    },
    "apple": {
        "display_name": "Apple",
        "category": "Temperate Orchard",
        "optimal_ranges": {"N": [15, 35], "P": [125, 145], "K": [195, 205], "temp": [18, 25], "humidity": [85, 95], "ph": [5.5, 6.8], "rainfall": [100, 140], "moisture": [50, 70]},
        "preferred_soil": ["mountain loam", "deep sandy loam", "forest loam"],
        "season": "Perennial / Whole Year",
        "duration_days": 240,
        "base_yield_quintal_acre": 55.0,
        "market_price_quintal": 7500,
        "cost_per_acre": 75000,
        "fertilizer_advice": "Requires 700g N, 350g P, 700g K per mature tree. Spray Boron and Zinc during pink bud stage.",
        "irrigation_advice": "Critical during fruit enlargement (May-July). Drip irrigation maintains consistent soil tension."
    },
    "orange": {
        "display_name": "Orange (Citrus)",
        "category": "Subtropical Fruit",
        "optimal_ranges": {"N": [15, 35], "P": [15, 35], "K": [10, 25], "temp": [20, 33], "humidity": [85, 95], "ph": [6.0, 7.5], "rainfall": [100, 130], "moisture": [45, 65]},
        "preferred_soil": ["loam", "red loam", "alluvial", "black"],
        "season": "Perennial / Whole Year",
        "duration_days": 240,
        "base_yield_quintal_acre": 60.0,
        "market_price_quintal": 4200,
        "cost_per_acre": 45000,
        "fertilizer_advice": "Apply 600g N, 200g P, 300g K per tree. Zinc Sulfate and Iron chelates prevent citrus mottle leaf.",
        "irrigation_advice": "Citrus is sensitive to water stagnation; provide ring-and-basin or micro-sprinkler irrigation."
    },
    "papaya": {
        "display_name": "Papaya",
        "category": "Tropical Fruit",
        "optimal_ranges": {"N": [40, 65], "P": [55, 75], "K": [45, 60], "temp": [23, 35], "humidity": [88, 95], "ph": [6.0, 7.2], "rainfall": [140, 220], "moisture": [55, 75]},
        "preferred_soil": ["loam", "alluvial", "sandy loam"],
        "season": "Whole Year",
        "duration_days": 270,
        "base_yield_quintal_acre": 140.0,
        "market_price_quintal": 1700,
        "cost_per_acre": 38000,
        "fertilizer_advice": "Apply 200g each of N, P, K per tree in 6 split doses during the first year.",
        "irrigation_advice": "Extremely susceptible to root rot and waterlogging. Raised ridge planting is mandatory."
    },
    "coconut": {
        "display_name": "Coconut (Palm)",
        "category": "Plantation / Oilseed",
        "optimal_ranges": {"N": [15, 35], "P": [15, 30], "K": [25, 40], "temp": [25, 32], "humidity": [90, 98], "ph": [5.5, 7.5], "rainfall": [130, 220], "moisture": [60, 80]},
        "preferred_soil": ["coastal sandy", "alluvial", "red sandy loam"],
        "season": "Perennial / Whole Year",
        "duration_days": 365,
        "base_yield_quintal_acre": 40.0,
        "market_price_quintal": 3600,
        "cost_per_acre": 32000,
        "fertilizer_advice": "Per palm per year: 500g N, 320g P, 1200g K. High Potassium and Magnesium required.",
        "irrigation_advice": "Provide 40-50 liters per palm per day during dry dry summer months via drip."
    },
    "cotton": {
        "display_name": "Cotton (White Gold)",
        "category": "Commercial / Fiber",
        "optimal_ranges": {"N": [100, 140], "P": [35, 60], "K": [15, 30], "temp": [22, 35], "humidity": [65, 85], "ph": [6.5, 8.2], "rainfall": [60, 110], "moisture": [40, 60]},
        "preferred_soil": ["black", "clay loam", "deep alluvial"],
        "season": "Kharif",
        "duration_days": 165,
        "base_yield_quintal_acre": 10.5,
        "market_price_quintal": 7020,
        "cost_per_acre": 25000,
        "fertilizer_advice": "Apply NPK 120:60:60. Top dress nitrogen at squaring and peak flowering stages.",
        "irrigation_advice": "Sensitive to waterlogging during early stages. Irrigate at boll formation."
    },
    "jute": {
        "display_name": "Jute (Golden Fiber)",
        "category": "Commercial / Fiber",
        "optimal_ranges": {"N": [60, 95], "P": [35, 60], "K": [35, 50], "temp": [24, 35], "humidity": [70, 90], "ph": [6.0, 7.5], "rainfall": [150, 220], "moisture": [65, 85]},
        "preferred_soil": ["alluvial", "clay loam", "silty loam"],
        "season": "Kharif",
        "duration_days": 120,
        "base_yield_quintal_acre": 14.0,
        "market_price_quintal": 5050,
        "cost_per_acre": 21000,
        "fertilizer_advice": "Apply 60 kg N, 30 kg P, 30 kg K per ha. Urea top dressing at 3-4 weeks after sowing.",
        "irrigation_advice": "High moisture requirement. Intermittent flooding tolerated during mature stages."
    },
    "coffee": {
        "display_name": "Coffee (Arabica / Robusta)",
        "category": "Plantation / Beverage",
        "optimal_ranges": {"N": [85, 120], "P": [20, 40], "K": [25, 40], "temp": [21, 28], "humidity": [55, 75], "ph": [5.5, 6.5], "rainfall": [115, 200], "moisture": [55, 75]},
        "preferred_soil": ["red loam", "forest loam", "humus rich clay loam"],
        "season": "Perennial / Whole Year",
        "duration_days": 300,
        "base_yield_quintal_acre": 8.5,
        "market_price_quintal": 22000,
        "cost_per_acre": 48000,
        "fertilizer_advice": "Apply NPK 120:90:120 in 3-4 splits. Regular liming to keep pH around 6.0.",
        "irrigation_advice": "Blossom and backing showers (25-40 mm) are critical in March-April for flowering."
    }
}

class CropPredictionEngine:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.encoder = None
        self.metadata = None
        self._load_artifacts()

    def _load_artifacts(self):
        if MODEL_PATH.exists() and SCALER_PATH.exists() and ENCODER_PATH.exists():
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
            self.encoder = joblib.load(ENCODER_PATH)
            if METADATA_PATH.exists():
                with open(METADATA_PATH, "r") as f:
                    self.metadata = json.load(f)
            print(f"[CropPredictionEngine] Loaded champion model: {self.metadata.get('champion_model', 'Random Forest') if self.metadata else 'Loaded'}")
        else:
            print("[CropPredictionEngine] Artifacts not found on disk. Please run train_models.py first.")

    def compute_agronomic_compatibility(self, crop: str, inputs: Dict[str, float]) -> Dict[str, Any]:
        """
        Computes domain-rule agronomic compatibility score and parameter-by-parameter analysis.
        """
        crop_data = CROP_AGRONOMIC_KNOWLEDGE.get(crop.lower())
        if not crop_data:
            return {"overall_suitability": 75.0, "soil_compat": 75.0, "weather_compat": 75.0, "radar": []}

        ranges = crop_data["optimal_ranges"]
        param_scores = {}

        # Evaluate each parameter relative to optimal agronomic range
        # Full score (100%) if inside [min, max], gradual linear decay outside
        for key, (low, high) in ranges.items():
            input_val = inputs.get(key, (low + high) / 2.0)
            if low <= input_val <= high:
                score = 100.0
            elif input_val < low:
                diff = low - input_val
                score = max(20.0, 100.0 - (diff / max(1.0, low)) * 120.0)
            else:
                diff = input_val - high
                score = max(20.0, 100.0 - (diff / max(1.0, high)) * 120.0)
            param_scores[key] = round(score, 1)

        # Group scores
        soil_compat = round((param_scores.get("N", 80)*0.25 + param_scores.get("P", 80)*0.25 + param_scores.get("K", 80)*0.25 + param_scores.get("ph", 80)*0.25), 1)
        weather_compat = round((param_scores.get("temp", 80)*0.35 + param_scores.get("humidity", 80)*0.25 + param_scores.get("rainfall", 80)*0.40), 1)
        overall_suitability = round((soil_compat * 0.45 + weather_compat * 0.55), 1)

        # Build radar/comparison breakdown
        radar_data = [
            {"subject": "Nitrogen", "farm": inputs.get("N", 50), "optimal": (ranges["N"][0] + ranges["N"][1]) / 2.0, "fullMark": 140},
            {"subject": "Phosphorus", "farm": inputs.get("P", 40), "optimal": (ranges["P"][0] + ranges["P"][1]) / 2.0, "fullMark": 145},
            {"subject": "Potassium", "farm": inputs.get("K", 40), "optimal": (ranges["K"][0] + ranges["K"][1]) / 2.0, "fullMark": 210},
            {"subject": "Temperature", "farm": inputs.get("temp", 25), "optimal": (ranges["temp"][0] + ranges["temp"][1]) / 2.0, "fullMark": 45},
            {"subject": "Humidity", "farm": inputs.get("humidity", 60), "optimal": (ranges["humidity"][0] + ranges["humidity"][1]) / 2.0, "fullMark": 100},
            {"subject": "Soil pH", "farm": inputs.get("ph", 6.5), "optimal": (ranges["ph"][0] + ranges["ph"][1]) / 2.0, "fullMark": 10},
            {"subject": "Rainfall", "farm": inputs.get("rainfall", 100), "optimal": (ranges["rainfall"][0] + ranges["rainfall"][1]) / 2.0, "fullMark": 300}
        ]

        return {
            "overall_suitability": overall_suitability,
            "soil_compat": soil_compat,
            "weather_compat": weather_compat,
            "param_scores": param_scores,
            "radar": radar_data,
            "details": crop_data
        }

    def predict(self, feature_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs ML prediction and produces comprehensive agronomic report.
        """
        if self.model is None:
            self._load_artifacts()
            if self.model is None:
                raise RuntimeError("ML model artifacts are not loaded.")

        # Extract features in exact order
        num_features = self.metadata["input_features"]
        feature_vals = []
        for feat in num_features:
            val = float(feature_dict.get(feat, 0.0))
            feature_vals.append(val)

        X_raw = np.array([feature_vals], dtype=np.float32)
        X_scaled = self.scaler.transform(X_raw)

        # Predict class probabilities
        probs = self.model.predict_proba(X_scaled)[0]
        classes = self.encoder.classes_

        # Rank all crops by probability
        ranked_indices = np.argsort(probs)[::-1]
        top_crop = classes[ranked_indices[0]]
        top_prob = float(probs[ranked_indices[0]])

        # Key farm input mapped for agronomic scoring
        input_agronomic_map = {
            "N": feature_dict.get("N", 50.0),
            "P": feature_dict.get("P", 40.0),
            "K": feature_dict.get("K", 40.0),
            "temp": feature_dict.get("temperature", 25.0),
            "humidity": feature_dict.get("humidity", 65.0),
            "ph": feature_dict.get("ph", 6.5),
            "rainfall": feature_dict.get("rainfall", 100.0),
            "moisture": feature_dict.get("soil_moisture", 50.0)
        }

        top_agronomy = self.compute_agronomic_compatibility(top_crop, input_agronomic_map)

        # Calibrated Suitability Score:
        # Combines ML statistical classification probability and agronomic soil/climate match
        calibrated_suitability = round(
            (top_prob * 0.40 * 100.0) + (top_agronomy["overall_suitability"] * 0.60), 1
        )
        calibrated_suitability = min(99.0, max(45.0, calibrated_suitability))

        # Top 5 alternative crops
        alternatives = []
        for idx in ranked_indices[1:6]:
            alt_crop = classes[idx]
            alt_prob = float(probs[idx])
            alt_agronomy = self.compute_agronomic_compatibility(alt_crop, input_agronomic_map)
            alt_suit = round((alt_prob * 0.35 * 100.0) + (alt_agronomy["overall_suitability"] * 0.65), 1)
            alt_data = CROP_AGRONOMIC_KNOWLEDGE.get(alt_crop.lower(), {})
            alternatives.append({
                "crop": alt_crop,
                "display_name": alt_data.get("display_name", alt_crop.title()),
                "category": alt_data.get("category", "Field Crop"),
                "confidence": round(alt_prob * 100.0, 1),
                "suitability_score": min(98.0, max(30.0, alt_suit)),
                "duration_days": alt_data.get("duration_days", 120),
                "market_price": alt_data.get("market_price_quintal", 3000),
                "season": alt_data.get("season", "Kharif")
            })

        # Calculate estimated economics
        crop_info = top_agronomy["details"]
        yield_per_acre = crop_info.get("base_yield_quintal_acre", 20.0)
        price_per_q = crop_info.get("market_price_quintal", 2500)
        cost_per_acre = crop_info.get("cost_per_acre", 20000)
        gross_revenue = round(yield_per_acre * price_per_q, 2)
        net_profit = round(gross_revenue - cost_per_acre, 2)
        roi_percent = round((net_profit / max(1.0, cost_per_acre)) * 100.0, 1)

        # Risk Indicators
        hw_risk = float(feature_dict.get("heatwave_risk", 0.0))
        drought_risk = float(feature_dict.get("drought_risk", 0.0))
        flood_risk = float(feature_dict.get("flood_risk", 0.0))
        frost_risk = float(feature_dict.get("frost_risk", 0.0))

        risk_levels = {
            "heatwave": {"level": "High" if hw_risk > 0.65 else ("Moderate" if hw_risk > 0.35 else "Low"), "score": round(hw_risk * 100, 1)},
            "drought": {"level": "Severe" if drought_risk > 0.70 else ("Moderate" if drought_risk > 0.40 else "Low"), "score": round(drought_risk * 100, 1)},
            "flood": {"level": "High" if flood_risk > 0.60 else ("Moderate" if flood_risk > 0.30 else "Low"), "score": round(flood_risk * 100, 1)},
            "frost": {"level": "High" if frost_risk > 0.60 else ("Moderate" if frost_risk > 0.25 else "Low"), "score": round(frost_risk * 100, 1)},
        }

        # Explainability key drivers
        key_drivers = []
        if top_agronomy["param_scores"].get("rainfall", 0) > 85:
            key_drivers.append(f"Optimal precipitation ({feature_dict.get('rainfall')}mm) matches {crop_info.get('display_name')} water requirements.")
        if top_agronomy["param_scores"].get("ph", 0) > 85:
            key_drivers.append(f"Soil pH ({feature_dict.get('ph')}) is in the prime nutrient absorption window.")
        if top_agronomy["param_scores"].get("temp", 0) > 80:
            key_drivers.append(f"Thermal conditions ({feature_dict.get('temperature')}°C) promote vigorous canopy growth.")
        if hw_risk > 0.6:
            key_drivers.append("Heatwave risk detected: heat-tolerant alternative crops and mulching recommended.")
        if not key_drivers:
            key_drivers.append("Balanced soil macronutrient and environmental conditions favor this crop profile.")

        return {
            "crop": top_crop,
            "display_name": crop_info.get("display_name", top_crop.title()),
            "category": crop_info.get("category", "Field Crop"),
            "model_confidence": round(top_prob * 100.0, 1),
            "suitability_score": calibrated_suitability,
            "soil_compatibility": top_agronomy["soil_compat"],
            "weather_compatibility": top_agronomy["weather_compat"],
            "top_alternatives": alternatives,
            "radar_data": top_agronomy["radar"],
            "economics": {
                "base_yield_quintal_acre": yield_per_acre,
                "market_price_quintal": price_per_q,
                "cost_per_acre": cost_per_acre,
                "gross_revenue": gross_revenue,
                "net_profit": net_profit,
                "roi_percent": roi_percent
            },
            "agronomic_advisory": {
                "duration_days": crop_info.get("duration_days", 120),
                "season": crop_info.get("season", "Kharif"),
                "preferred_soil": crop_info.get("preferred_soil", ["Loam"]),
                "fertilizer_guidance": crop_info.get("fertilizer_advice", "Standard NPK balanced schedule."),
                "irrigation_guidance": crop_info.get("irrigation_advice", "Scheduled furrow/drip irrigation.")
            },
            "risk_assessment": risk_levels,
            "key_drivers": key_drivers,
            "model_version": self.metadata.get("version", "v2.4.0"),
            "model_name": self.metadata.get("champion_model", "Random Forest")
        }

# Singleton instance
engine = CropPredictionEngine()
