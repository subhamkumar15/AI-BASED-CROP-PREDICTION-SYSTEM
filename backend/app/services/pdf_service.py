"""
PDF Report Generation Service
Generates downloadable, executive agronomic intelligence dossiers using ReportLab.
"""

import io
from datetime import datetime
from typing import Any, Dict
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

def generate_prediction_pdf(prediction_data: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#065f46"),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#475569")
    )
    section_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1e293b")
    )
    bold_style = ParagraphStyle(
        "BoldText",
        parent=body_style,
        fontName="Helvetica-Bold"
    )

    elements = []

    # 1. Header Banner
    elements.append(Paragraph("AGRISENSE — SMART AGRICULTURE INTELLIGENCE REPORT", title_style))
    elements.append(Paragraph(f"Autonomous Soil & Climate Crop Recommendation Dossier | Generated on {datetime.now().strftime('%B %d, %Y - %I:%M %p')}", subtitle_style))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#10b981"), spaceAfter=14))

    # 2. Executive Summary Card (Table)
    crop_name = prediction_data.get("display_name", prediction_data.get("crop", "Rice")).upper()
    suitability = prediction_data.get("suitability_score", 95.0)
    confidence = prediction_data.get("model_confidence", 92.0)
    model_version = prediction_data.get("model_version", "v2.4.0")

    summary_data = [
        [
            Paragraph("<b>PRIMARY RECOMMENDED CROP</b>", ParagraphStyle("WhiteTextSmall", parent=body_style, textColor=colors.whitesmoke)),
            Paragraph("<b>SUITABILITY SCORE</b>", ParagraphStyle("WhiteTextSmall", parent=body_style, textColor=colors.whitesmoke)),
            Paragraph("<b>MODEL CONFIDENCE</b>", ParagraphStyle("WhiteTextSmall", parent=body_style, textColor=colors.whitesmoke)),
            Paragraph("<b>MODEL ENGINE</b>", ParagraphStyle("WhiteTextSmall", parent=body_style, textColor=colors.whitesmoke))
        ],
        [
            Paragraph(f"<b><font size=14 color='#ffffff'>{crop_name}</font></b>", body_style),
            Paragraph(f"<b><font size=14 color='#34d399'>{suitability}%</font></b>", body_style),
            Paragraph(f"<b><font size=14 color='#60a5fa'>{confidence}%</font></b>", body_style),
            Paragraph(f"<b><font size=11 color='#ffffff'>{model_version}</font></b>", body_style)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[200, 110, 110, 120])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#064e3b")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#047857"))
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 14))

    # 3. Farm Input Parameters
    elements.append(Paragraph("1. Farm & Soil Input Characteristics", section_style))
    inputs = prediction_data.get("inputs", {})
    input_rows = [
        [
            Paragraph("<b>Parameter</b>", bold_style), Paragraph("<b>Value Recorded</b>", bold_style),
            Paragraph("<b>Parameter</b>", bold_style), Paragraph("<b>Value Recorded</b>", bold_style)
        ],
        [
            Paragraph("Soil Nitrogen (N)", body_style), Paragraph(f"{inputs.get('N', 'N/A')} kg/ha", body_style),
            Paragraph("Temperature", body_style), Paragraph(f"{inputs.get('temperature', 'N/A')} °C", body_style)
        ],
        [
            Paragraph("Soil Phosphorus (P)", body_style), Paragraph(f"{inputs.get('P', 'N/A')} kg/ha", body_style),
            Paragraph("Relative Humidity", body_style), Paragraph(f"{inputs.get('humidity', 'N/A')} %", body_style)
        ],
        [
            Paragraph("Soil Potassium (K)", body_style), Paragraph(f"{inputs.get('K', 'N/A')} kg/ha", body_style),
            Paragraph("Annual Rainfall", body_style), Paragraph(f"{inputs.get('rainfall', 'N/A')} mm", body_style)
        ],
        [
            Paragraph("Soil pH Reaction", body_style), Paragraph(f"{inputs.get('ph', 'N/A')}", body_style),
            Paragraph("Soil Moisture", body_style), Paragraph(f"{inputs.get('soil_moisture', '45.0')} %", body_style)
        ],
        [
            Paragraph("Soil Texture Type", body_style), Paragraph(f"{inputs.get('soil_type', 'Loam').capitalize()}", body_style),
            Paragraph("Farming Season", body_style), Paragraph(f"{inputs.get('season', 'Kharif')}", body_style)
        ]
    ]
    inp_table = Table(input_rows, colWidths=[135, 135, 135, 135])
    inp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(inp_table)
    elements.append(Spacer(1, 12))

    # 4. Projected Economics & Financial Returns
    elements.append(Paragraph("2. Agronomic Financial Projections", section_style))
    econ = prediction_data.get("economics", {})
    econ_rows = [
        [
            Paragraph("<b>Expected Yield</b>", bold_style),
            Paragraph("<b>Market Price</b>", bold_style),
            Paragraph("<b>Cost of Cultivation</b>", bold_style),
            Paragraph("<b>Gross Revenue</b>", bold_style),
            Paragraph("<b>Projected ROI</b>", bold_style)
        ],
        [
            Paragraph(f"{econ.get('base_yield_quintal_acre', 20)} q/acre", body_style),
            Paragraph(f"₹{econ.get('market_price_quintal', 2500)} /q", body_style),
            Paragraph(f"₹{econ.get('cost_per_acre', 20000)} /acre", body_style),
            Paragraph(f"<b>₹{econ.get('gross_revenue', 50000):,.0f}</b>", body_style),
            Paragraph(f"<b><font color='#059669'>+{econ.get('roi_percent', 150)}%</font></b>", body_style)
        ]
    ]
    econ_table = Table(econ_rows, colWidths=[108, 108, 108, 108, 108])
    econ_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#ecfdf5")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#a7f3d0")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5)
    ]))
    elements.append(econ_table)
    elements.append(Spacer(1, 12))

    # 5. Top 5 Alternative Crops
    elements.append(Paragraph("3. Top Ranked Alternative Crops", section_style))
    alt_crops = prediction_data.get("top_alternatives", [])
    alt_rows = [
        [
            Paragraph("<b>Rank</b>", bold_style),
            Paragraph("<b>Crop Name</b>", bold_style),
            Paragraph("<b>Category</b>", bold_style),
            Paragraph("<b>Suitability</b>", bold_style),
            Paragraph("<b>Cycle (Days)</b>", bold_style),
            Paragraph("<b>Market Price</b>", bold_style)
        ]
    ]
    for i, alt in enumerate(alt_crops[:5], 1):
        alt_rows.append([
            Paragraph(f"#{i}", body_style),
            Paragraph(alt.get("display_name", alt.get("crop", "")), bold_style),
            Paragraph(alt.get("category", "Field Crop"), body_style),
            Paragraph(f"{alt.get('suitability_score', 80)}%", body_style),
            Paragraph(f"{alt.get('duration_days', 120)} days", body_style),
            Paragraph(f"₹{alt.get('market_price', 2500)}/q", body_style)
        ])
    alt_table = Table(alt_rows, colWidths=[45, 145, 110, 80, 80, 80])
    alt_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f8fafc")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4)
    ]))
    elements.append(alt_table)
    elements.append(Spacer(1, 12))

    # 6. Agronomic Management Advisory
    elements.append(Paragraph("4. Recommended Agronomic Field Management", section_style))
    advisory = prediction_data.get("agronomic_advisory", {})
    fert = advisory.get("fertilizer_guidance", "Apply balanced NPK as per soil test report.")
    irrig = advisory.get("irrigation_guidance", "Maintain adequate root zone moisture.")

    elements.append(Paragraph(f"<b>• Fertilizer Scheduling:</b> {fert}", body_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(f"<b>• Irrigation Guidance:</b> {irrig}", body_style))
    elements.append(Spacer(1, 16))

    # 7. Official Seal / Footer Note
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=8))
    footer_text = (
        "Generated autonomously by the AGRISENSE Precision Agriculture AI Decision Support System. "
        "Predictions are derived from supervised multi-variate ML classification models validated against ICAR and FAO benchmarks. "
        "Always confirm chemical treatments with your local Krishi Vigyan Kendra (KVK) officer."
    )
    elements.append(Paragraph(footer_text, ParagraphStyle("Footer", parent=body_style, fontSize=7.5, leading=10, textColor=colors.HexColor("#64748b"))))

    doc.build(elements)
    return buffer.getvalue()
