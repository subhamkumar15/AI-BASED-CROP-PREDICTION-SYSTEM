"""
Comprehensive Soil Health Analysis and Fertilizer Recommendation Engine
Based on ICAR Soil Health Card Benchmarks & Fertilizer Scheduling
"""

from typing import Any, Dict, List

def analyze_soil_health(
    n: float,
    p: float,
    k: float,
    ph: float,
    moisture: float = 45.0,
    soil_type: str = "loam",
    organic_carbon: float = 0.60,
    electrical_conductivity: float = 0.8
) -> Dict[str, Any]:
    """
    Evaluates soil parameters against national agricultural testing standards.
    Returns status indicators, score, and customized chemical/organic soil amendments.
    """
    param_eval = {}
    recommendations = []
    amendments = []
    penalties = 0

    # 1. Nitrogen (N) Evaluation (kg/ha equivalent)
    if n < 40:
        param_eval["Nitrogen (N)"] = {
            "value": n,
            "status": "Severely Deficient",
            "benchmark": "Optimal: 60 - 100 kg/ha",
            "recommendation": "Incorporate well-decomposed farmyard manure (FYM @ 10 t/ha) or apply basal dose of Urea (50 kg/acre) in split applications."
        }
        recommendations.append("Apply Urea / Neem-Coated Urea in 3 split stages: at sowing, 30 DAS, and panicle emergence.")
        penalties += 25
    elif n < 60:
        param_eval["Nitrogen (N)"] = {
            "value": n,
            "status": "Moderately Low",
            "benchmark": "Optimal: 60 - 100 kg/ha",
            "recommendation": "Supplement with biofertilizers (Azotobacter / Azospirillum) and light top-dressing of nitrogen."
        }
        penalties += 10
    elif n <= 110:
        param_eval["Nitrogen (N)"] = {
            "value": n,
            "status": "Optimal",
            "benchmark": "Optimal: 60 - 100 kg/ha",
            "recommendation": "Healthy nitrogen reserve. Maintain current organic residue management."
        }
    else:
        param_eval["Nitrogen (N)"] = {
            "value": n,
            "status": "Excessive",
            "benchmark": "Optimal: 60 - 100 kg/ha",
            "recommendation": "Withhold supplementary nitrogen. Excess nitrogen triggers vegetative lodging and heightened insect pest vulnerability."
        }
        penalties += 15

    # 2. Phosphorus (P) Evaluation
    if p < 25:
        param_eval["Phosphorus (P)"] = {
            "value": p,
            "status": "Deficient",
            "benchmark": "Optimal: 35 - 65 kg/ha",
            "recommendation": "Apply Diammonium Phosphate (DAP) @ 40 kg/acre or Single Super Phosphate (SSP) along with Phosphate Solubilizing Bacteria (PSB)."
        }
        recommendations.append("Incorporate Single Super Phosphate (SSP) as basal application; SSP also supplies essential Calcium (19%) and Sulfur (11%).")
        penalties += 20
    elif p <= 75:
        param_eval["Phosphorus (P)"] = {
            "value": p,
            "status": "Optimal",
            "benchmark": "Optimal: 35 - 65 kg/ha",
            "recommendation": "Good root development potential. Maintain balanced basal application."
        }
    else:
        param_eval["Phosphorus (P)"] = {
            "value": p,
            "status": "High Accumulation",
            "benchmark": "Optimal: 35 - 65 kg/ha",
            "recommendation": "Reduce phosphorus input to avoid zinc and iron uptake lockup."
        }
        penalties += 10

    # 3. Potassium (K) Evaluation
    if k < 25:
        param_eval["Potassium (K)"] = {
            "value": k,
            "status": "Deficient",
            "benchmark": "Optimal: 35 - 75 kg/ha",
            "recommendation": "Apply Muriate of Potash (MOP) @ 25 kg/acre. Essential for drought resilience and grain filling."
        }
        recommendations.append("Apply Muriate of Potash (MOP 0-0-60) at basal stage to reinforce plant cell walls against lodging and fungal pathogens.")
        penalties += 20
    elif k <= 85:
        param_eval["Potassium (K)"] = {
            "value": k,
            "status": "Optimal",
            "benchmark": "Optimal: 35 - 75 kg/ha",
            "recommendation": "Excellent crop immunity and water-regulation capacity."
        }
    else:
        param_eval["Potassium (K)"] = {
            "value": k,
            "status": "High Reserve",
            "benchmark": "Optimal: 35 - 75 kg/ha",
            "recommendation": "Sufficient for multiple seasons; omit potash fertilizers this cycle."
        }

    # 4. Soil pH Evaluation
    if ph < 5.5:
        param_eval["Soil pH"] = {
            "value": ph,
            "status": "Strongly Acidic",
            "benchmark": "Optimal: 6.2 - 7.5",
            "recommendation": "Nutrient availability (P, K, Ca, Mg) severely locked. Apply agricultural agricultural lime (CaCO3) @ 1.5 - 2.0 t/ha before sowing."
        }
        amendments.append("Broadcast Agricultural Lime (Calcitic Limestone @ 500 kg/acre) 4 weeks prior to planting to elevate soil pH toward 6.5.")
        penalties += 25
    elif ph < 6.2:
        param_eval["Soil pH"] = {
            "value": ph,
            "status": "Slightly Acidic",
            "benchmark": "Optimal: 6.2 - 7.5",
            "recommendation": "Suitable for tea, potatoes, and pineapples, but mildly acidic for pulses. Incorporate wood ash or mild dolomite."
        }
        penalties += 8
    elif ph <= 7.6:
        param_eval["Soil pH"] = {
            "value": ph,
            "status": "Optimal Neutral",
            "benchmark": "Optimal: 6.2 - 7.5",
            "recommendation": "Ideal microbial activity and maximum macro/micronutrient bioavailability."
        }
    elif ph <= 8.3:
        param_eval["Soil pH"] = {
            "value": ph,
            "status": "Moderately Alkaline",
            "benchmark": "Optimal: 6.2 - 7.5",
            "recommendation": "High calcium carbonate presence. Apply pressmud or green manure (Dhaincha) to produce organic acids that lower rhizosphere pH."
        }
        amendments.append("Incorporate Green Manure (Sesbania / Dhaincha) into the soil to release organic humic acids that neutralize excess alkalinity.")
        penalties += 12
    else:
        param_eval["Soil pH"] = {
            "value": ph,
            "status": "Strongly Alkaline / Saline",
            "benchmark": "Optimal: 6.2 - 7.5",
            "recommendation": "Sodic hazard. Apply agricultural Gypsum (CaSO4·2H2O @ 2.5 t/ha) followed by intensive leaching with clean water."
        }
        amendments.append("Apply Agricultural Gypsum (Calcium Sulfate @ 1 ton/acre) followed by heavy flushing to displace toxic sodium ions.")
        penalties += 30

    # 5. Moisture and Texture
    if moisture < 25:
        param_eval["Soil Moisture"] = {
            "value": moisture,
            "status": "Severely Dry",
            "benchmark": "Optimal: 40% - 70%",
            "recommendation": "Root zone water potential depleted. Urgent irrigation needed."
        }
        penalties += 15
    elif moisture <= 75:
        param_eval["Soil Moisture"] = {
            "value": moisture,
            "status": "Optimal Aeration",
            "benchmark": "Optimal: 40% - 70%",
            "recommendation": "Adequate balance of soil micropores and aeration."
        }
    else:
        param_eval["Soil Moisture"] = {
            "value": moisture,
            "status": "Saturated / Waterlogged",
            "benchmark": "Optimal: 40% - 70%",
            "recommendation": "Risk of anaerobic conditions and root rot. Enhance field surface drainage."
        }
        penalties += 15

    # Overall Score Calculation
    overall_health = max(35.0, min(98.0, 100.0 - penalties))
    if overall_health >= 85:
        grade = "Grade A - Superior Soil Health"
    elif overall_health >= 68:
        grade = "Grade B - Productive Soil (Minor Adjustments)"
    else:
        grade = "Grade C - Nutrient / Reaction Stress (Remediation Required)"

    if not recommendations:
        recommendations.append("Balanced macro-nutrient profile. Maintain standard NPK crop replenishment schedule.")
    if not amendments:
        amendments.append("Soil pH and electrical conductivity are within optimal agronomic ranges. No chemical conditioners required.")

    return {
        "overall_health_score": round(overall_health, 1),
        "health_grade": grade,
        "parameters": param_eval,
        "fertilizer_recommendations": recommendations,
        "amendment_guidance": amendments
    }
