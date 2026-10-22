
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

from predict import predict_disease, get_supported_symptoms

from io import BytesIO
from datetime import datetime
from xml.sax.saxutils import escape
import os

from google import genai
from google.genai import types

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


# ============================================================
# CREATE FLASK APP AND CONFIGURE CORS
# ============================================================


app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:8000",
                "http://127.0.0.1:8000",
                "https://silver-figolla-6465f9.netlify.app",
            ]
        }
    },
)



# ============================================================
# HOME ROUTE
# ============================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "MedIntel AI API is running",
        "service": "Disease Prediction API",
    })


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "status": "online",
    })


# ============================================================
# SUPPORTED SYMPTOMS
# ============================================================

@app.route("/api/symptoms", methods=["GET"])
def get_symptoms():
    try:
        return jsonify({
            "success": True,
            "symptoms": get_supported_symptoms(),
        })
    except Exception:
        app.logger.exception("Symptom list error")

        return jsonify({
            "success": False,
            "message": "Could not load supported symptoms.",
        }), 500


# ============================================================
# DISEASE PREDICTION
# ============================================================

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({
                "success": False,
                "message": "Please provide valid JSON data.",
            }), 400

        symptoms = data.get("symptoms")

        if not isinstance(symptoms, list) or not symptoms:
            return jsonify({
                "success": False,
                "message": "Please provide at least one symptom.",
            }), 400

        result = predict_disease(symptoms, top_n=3)
        return jsonify(result)

    except Exception:
        app.logger.exception("Prediction error")

        return jsonify({
            "success": False,
            "message": "An error occurred while making the prediction.",
        }), 500


# ============================================================
# PDF HEALTH REPORT
# ============================================================

@app.route("/api/health-report", methods=["POST"])
def generate_health_report():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "Please provide valid JSON report data.",
        }), 400

    patient_name = str(
        data.get("patient_name") or "Not provided"
    )[:100]

    age = str(data.get("age") or "Not provided")[:10]
    gender = str(data.get("gender") or "Not provided")[:30]

    report_date = datetime.now().strftime("%d %B %Y, %I:%M %p")

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title="MedIntel AI Health Report",
    )

    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="ReportTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        textColor=colors.HexColor("#174A7E"),
        fontSize=21,
        spaceAfter=8,
    ))

    story = [
        Paragraph("MedIntel AI", styles["ReportTitle"]),
        Paragraph("Personal Health Summary", styles["Heading2"]),
        Spacer(1, 8),
        Paragraph(
            f"<b>Patient:</b> {escape(patient_name)}",
            styles["BodyText"],
        ),
        Paragraph(
            f"<b>Age:</b> {escape(age)}",
            styles["BodyText"],
        ),
        Paragraph(
            f"<b>Gender:</b> {escape(gender)}",
            styles["BodyText"],
        ),
        Paragraph(
            f"<b>Report generated:</b> {escape(report_date)}",
            styles["BodyText"],
        ),
        Spacer(1, 16),
        Paragraph("Health Information", styles["Heading2"]),
    ]

    # Health measurements
    rows = [["Metric", "Recorded value"]]

    for key, label in [
        ("bmi", "Body Mass Index (BMI)"),
        ("bmi_category", "BMI category"),
        ("water_intake", "Estimated daily water intake"),
    ]:
        value = data.get(key)

        if value is not None and str(value).strip():
            rows.append([label, escape(str(value)[:200])])

    if len(rows) == 1:
        rows.append([
            "Health measurements",
            "No measurements supplied for this report",
        ])

    table = Table(
        rows,
        colWidths=[75 * mm, 85 * mm],
        repeatRows=1,
    )

    table.setStyle(TableStyle([
        (
            "BACKGROUND",
            (0, 0),
            (-1, 0),
            colors.HexColor("#174A7E"),
        ),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        (
            "GRID",
            (0, 0),
            (-1, -1),
            0.5,
            colors.HexColor("#D6DEE8"),
        ),
        (
            "BACKGROUND",
            (0, 1),
            (-1, -1),
            colors.HexColor("#F5F8FC"),
        ),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    story.extend([
        table,
        Spacer(1, 18),
        Paragraph("Disease Prediction History", styles["Heading2"]),
    ])

    predictions = data.get("predictions", [])

    if not isinstance(predictions, list):
        predictions = []

    valid_predictions = [
        item for item in predictions[:10]
        if isinstance(item, dict)
    ]

    if valid_predictions:
        for item in valid_predictions:
            disease = escape(
                str(item.get("disease") or "Unknown")[:150]
            )

            score = item.get("probability")
            probability_text = ""

            if (
                isinstance(score, (int, float))
                and not isinstance(score, bool)
                and 0 <= score <= 100
            ):
                probability_text = (
                    f" — Model probability estimate: {score:.2f}%"
                )

            story.append(Paragraph(
                f"&bull; {disease}{probability_text}",
                styles["BodyText"],
            ))
            story.append(Spacer(1, 4))
    else:
        story.append(Paragraph(
            "No prediction records were supplied.",
            styles["BodyText"],
        ))

    # Symptoms entered
    symptoms = data.get("symptoms", [])

    if isinstance(symptoms, list) and symptoms:
        safe_symptoms = [
            escape(str(symptom)[:100])
            for symptom in symptoms[:50]
        ]

        story.extend([
            Spacer(1, 10),
            Paragraph("Symptoms Entered", styles["Heading2"]),
            Paragraph(", ".join(safe_symptoms), styles["BodyText"]),
        ])

    # Medical disclaimer
    story.extend([
        Spacer(1, 18),
        Paragraph("Important Medical Disclaimer", styles["Heading2"]),
        Paragraph(
            "This report is for informational and educational purposes "
            "only. Disease predictions are machine-learning estimates "
            "and are not confirmed diagnoses or validated clinical risk "
            "scores. BMI and water-intake calculations have limitations "
            "and may not be appropriate for every individual. This report "
            "does not replace advice from a qualified healthcare "
            "professional. Seek urgent medical care for emergencies.",
            styles["BodyText"],
        ),
    ])

    try:
        document.build(story)
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="MedIntel_Health_Report.pdf",
        )

    except Exception:
        app.logger.exception("PDF generation error")

        return jsonify({
            "success": False,
            "message": "Could not generate the health report.",
        }), 500


# ============================================================
# AI HEALTH ASSISTANT - GEMINI API
# ============================================================

@app.route("/api/health-assistant", methods=["POST"])
def health_assistant():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "Please send a valid JSON request.",
        }), 400

    messages = data.get("messages")

    if not isinstance(messages, list) or not messages:
        return jsonify({
            "success": False,
            "message": "Please enter a health question.",
        }), 400

    conversation = []

    for message in messages[-10:]:
        if not isinstance(message, dict):
            continue

        role = message.get("role")
        content = message.get("content")

        if role not in ("user", "assistant"):
            continue

        if not isinstance(content, str):
            continue

        content = content.strip()

        if not content:
            continue

        if len(content) > 2000:
            return jsonify({
                "success": False,
                "message": "Each message must be 2,000 characters or fewer.",
            }), 400

        conversation.append((role, content))

    if not conversation or conversation[-1][0] != "user":
        return jsonify({
            "success": False,
            "message": "Please enter a valid question.",
        }), 400

    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        return jsonify({
            "success": False,
            "message": "GEMINI_API_KEY is not configured in the Flask environment.",
        }), 503

    system_instruction = """
You are the MedIntel AI Health Assistant, an educational health
information assistant.

- Provide clear, calm, practical general health information.
- Do not diagnose a user or confirm a disease.
- Do not prescribe medication or personalized medication dosages.
- Explain uncertainty and recommend qualified medical assessment when
  appropriate.
- Machine-learning predictions are not confirmed diagnoses or validated
  clinical risk scores.
- For suspected dengue, recommend prompt medical assessment. Mention
  urgent warning signs such as severe abdominal pain, persistent vomiting,
  bleeding, breathing difficulty, confusion, or marked weakness.
- If emergency symptoms are described, advise seeking emergency care
  immediately.
- Do not recommend aspirin or ibuprofen for suspected dengue unless a
  clinician specifically advises otherwise.
- Do not claim to have examined the user or accessed medical records.
- Keep responses concise, respectful, and easy to understand.
- This assistant is not a substitute for professional medical care.
"""

    transcript = "\n".join(
        f"{'User' if role == 'user' else 'Assistant'}: {content}"
        for role, content in conversation
    )

    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=os.environ.get(
            "GEMINI_MODEL",
            "gemini-3.8-flash"
            ),
            contents=transcript,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.4,
                max_output_tokens=700,
            ),
        )

        answer = response.text

        if not answer:
            raise ValueError("Gemini returned an empty response.")

        return jsonify({
            "success": True,
            "reply": answer,
        })

    except Exception:
        app.logger.exception("AI Health Assistant / Gemini API error")

        return jsonify({
            "success": False,
            "message": (
                "The AI service could not complete the request. "
                "Check the Flask terminal for details."
            ),
        }), 502


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("MedIntel AI Flask API")
    print("=" * 60)
    print("Server:          http://127.0.0.1:5000")
    print("Health check:    http://127.0.0.1:5000/api/health")
    print("Disease predict: http://127.0.0.1:5000/api/predict")
    print("Health report:   http://127.0.0.1:5000/api/health-report")
    print("AI assistant:    http://127.0.0.1:5000/api/health-assistant")
    print("=" * 60)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )
