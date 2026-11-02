"""
AGRISENSE Agronomic AI Assistant Service
Provides grounded agricultural intelligence, decision support, and conversational expertise.
"""

import os
import re
from typing import Any, Dict, List, Optional

AGRI_KNOWLEDGE_BASE = [
    {
        "keywords": ["nitrogen", "urea", "yellow leaf", "yellowing", "deficiency n"],
        "topic": "Nitrogen Management",
        "answer": (
            "Nitrogen (N) is crucial for vegetative chlorophyll synthesis. \n\n"
            "• **Symptoms of Deficiency**: Older leaves turn pale yellow starting from the tip downwards (V-shaped chlorosis), while younger leaves stay light green.\n"
            "• **Corrective Action**: Top-dress Neem-Coated Urea in split doses (e.g. 30 kg/acre). Avoid single heavy applications as 40-60% of nitrogen can be lost through leaching and volatilization.\n"
            "• **Organic Alternative**: Incorporate composted poultry manure, vermicompost (2 t/acre), or foliar spray of 2% Urea solution for immediate uptake."
        ),
        "suggestions": ["How do I calculate DAP requirements?", "What causes leaves to turn purple?", "Tell me about biofertilizers."]
    },
    {
        "keywords": ["phosphorus", "dap", "root", "purple leaves", "p deficiency"],
        "topic": "Phosphorus Management",
        "answer": (
            "Phosphorus (P) drives rapid root establishment, tillering, and flowering. \n\n"
            "• **Symptoms of Deficiency**: Stunted seedling growth with characteristic dark reddish-purple coloration on leaf stems and undersides.\n"
            "• **Application**: Apply Diammonium Phosphate (DAP 18-46-0) or Single Super Phosphate (SSP 0-16-0) as a **basal dressing** near the seed furrow. Phosphorus has low soil mobility and must be placed in the root zone.\n"
            "• **Bio-enhancer**: Inoculate seeds with Phosphate Solubilizing Bacteria (PSB @ 10 g/kg seed) to solubilize fixed soil phosphates."
        ),
        "suggestions": ["When should MOP be applied?", "How to fix alkaline soil?", "Best crops for Kharif season."]
    },
    {
        "keywords": ["potassium", "potash", "mop", "burnt edges", "k deficiency"],
        "topic": "Potassium Nutrition & Crop Immunity",
        "answer": (
            "Potassium (K) regulates stomatal opening, drought resilience, and grain quality.\n\n"
            "• **Symptoms of Deficiency**: Marginal leaf scorch ('firing') where leaf margins look burnt and brown, coupled with weak stems prone to lodging.\n"
            "• **Recommendation**: Apply Muriate of Potash (MOP 0-0-60) at basal sowing. For fruit crops, supplement with Potassium Sulfate (0-0-50) or Potassium Nitrate (13-0-45) foliar spray during fruit enlargement."
        ),
        "suggestions": ["What is the ideal soil pH?", "How to manage drought stress?", "Recommended crops for black soil."]
    },
    {
        "keywords": ["ph", "acidic", "alkaline", "lime", "gypsum", "saline"],
        "topic": "Soil Reaction & Remediation",
        "answer": (
            "Soil pH determines nutrient availability to crop root systems:\n\n"
            "• **Optimal Range**: 6.2 to 7.5 (Neutral to slightly acidic).\n"
            "• **Acidic Soil (pH < 6.0)**: Aluminum and manganese toxicity occur, and phosphorus becomes locked. **Solution**: Broadcast agricultural lime (CaCO3 @ 1 to 2 t/ha) 4 weeks before planting.\n"
            "• **Alkaline / Sodic Soil (pH > 8.0)**: Zinc, iron, and boron become unavailable. **Solution**: Apply agricultural Gypsum (CaSO4·2H2O @ 2.5 t/ha) followed by good irrigation flushing to displace sodium ions."
        ),
        "suggestions": ["How does drip irrigation save water?", "Symptoms of blight in tomatoes?", "Which crops grow in sandy soil?"]
    },
    {
        "keywords": ["heatwave", "heat stress", "high temperature", "extreme heat"],
        "topic": "Heatwave Protection & Crop Preservation",
        "answer": (
            "Extreme heatwaves (>38°C) cause pollen sterility, blossom drop, and severe moisture stress:\n\n"
            "1. **Irrigation Timing**: Irrigate exclusively in the late evening or early morning to cool root zones.\n"
            "2. **Soil Mulching**: Cover beds with 5-7 cm of paddy straw or plastic reflective mulch to cut soil temperature by 4-6°C.\n"
            "3. **Anti-Transpirant Spray**: Foliar spray of Potassium Nitrate (1%) or Kaolin clay (5%) reflects solar radiation and reduces transpiration water loss by up to 25%."
        ),
        "suggestions": ["How to detect pest attacks early?", "What crops suit Rabi season?", "Drought risk mitigation."]
    },
    {
        "keywords": ["pest", "disease", "insect", "spray", "blight", "fungus"],
        "topic": "Integrated Pest Management (IPM)",
        "answer": (
            "AGRISENSE promotes Integrated Pest Management (IPM) to minimize chemical input:\n\n"
            "• **Early Scouting**: Inspect 10 plants per acre twice weekly across an 'X' pattern.\n"
            "• **Biological Barriers**: Install yellow sticky traps (15/acre) for sucking pests (whiteflies, aphids) and blue sticky traps for thrips.\n"
            "• **Bio-Pesticides**: Spray cold-pressed Neem Oil (10,000 ppm @ 3 ml/L) or Bacillus thuringiensis (Bt) at the first sighting of larvae.\n"
            "• **Computer Vision**: You can upload a photo of the affected leaf in our **Pest Detection** module for automated visual diagnosis."
        ),
        "suggestions": ["Open Pest Detection module", "How to prepare Bordeaux mixture?", "Fertilizer schedule for Rice."]
    },
    {
        "keywords": ["kharif", "rabi", "zaid", "season", "planting time"],
        "topic": "Indian Cropping Seasons Calendar",
        "answer": (
            "The Indian agricultural cycle is structured across three core seasons:\n\n"
            "• **Kharif (Monsoon)**: Sown in June-July, harvested in Oct-Nov. Crops: Rice, Maize, Cotton, Soybean, Jute, Pigeonpea (Arhar), Groundnut.\n"
            "• **Rabi (Winter)**: Sown in Oct-Dec, harvested in March-April. Crops: Wheat, Chickpea (Chana), Mustard, Barley, Lentil, Potato.\n"
            "• **Zaid (Summer)**: Sown in March, harvested in June. Crops: Watermelon, Muskmelon, Cucumber, Mung bean (Moong), Fodder crops."
        ),
        "suggestions": ["Predict best crop for my farm", "Cost and revenue projection for Cotton", "Weather forecast for my district."]
    }
]

class AgronomicChatService:
    def answer_query(self, query: str, farm_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        q_lower = query.lower().strip()

        # Check for contextual farm data (e.g., if user has active prediction)
        context_prefix = ""
        if farm_context and "crop" in farm_context:
            c = farm_context.get("crop")
            context_prefix = f"[Active Farm Context: Recommending {c.title()} with Suitability {farm_context.get('suitability_score', 85)}%]\n\n"

        # Match against agronomic knowledge base
        best_match = None
        max_matches = 0

        for item in AGRI_KNOWLEDGE_BASE:
            matches = sum(1 for kw in item["keywords"] if kw in q_lower)
            if matches > max_matches:
                max_matches = matches
                best_match = item

        if best_match and max_matches > 0:
            reply = context_prefix + best_match["answer"]
            return {
                "reply": reply,
                "suggested_questions": best_match["suggestions"],
                "referenced_topics": [best_match["topic"], "ICAR Agronomic Standards"]
            }

        # Fallback intelligent advisory
        generic_reply = (
            context_prefix +
            f"Regarding **'{query}'**: \n\n"
            "In precision agriculture, optimal crop yield relies on the balance between soil chemistry (NPK, pH, organic carbon), "
            "environmental moisture, and regional weather conditions. \n\n"
            "• **Next Steps**: You can run an automated **Crop Prediction** test on your soil values or upload a leaf photo to our **Pest Detection** system.\n"
            "• **Advisory Note**: Always verify chemical dosages against local Agriculture University guidelines before widespread application."
        )

        return {
            "reply": generic_reply,
            "suggested_questions": [
                "What are the ideal NPK values for wheat?",
                "How to protect crops against heatwaves?",
                "What is the best crop for sandy loam soil?"
            ],
            "referenced_topics": ["General Agronomy", "Precision Farming Advisory"]
        }

chat_service = AgronomicChatService()
