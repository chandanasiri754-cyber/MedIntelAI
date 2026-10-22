import os
import joblib
import numpy as np


# ============================================================
# 1. PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "disease_model.pkl"
)

SYMPTOM_ENCODER_PATH = os.path.join(
    MODEL_DIR,
    "symptom_encoder.pkl"
)

LABEL_ENCODER_PATH = os.path.join(
    MODEL_DIR,
    "label_encoder.pkl"
)


# ============================================================
# 2. LOAD TRAINED MODEL
# ============================================================

print("Loading MedIntel AI model...")

model = joblib.load(MODEL_PATH)

symptom_encoder = joblib.load(
    SYMPTOM_ENCODER_PATH
)

label_encoder = joblib.load(
    LABEL_ENCODER_PATH
)

print("Model loaded successfully.")


# ============================================================
# 3. PREDICTION FUNCTION
# ============================================================

def predict_disease(symptoms, top_n=3):
    """
    Predicts the most probable diseases from a list of symptoms.

    Parameters:
        symptoms: list of symptom names
        top_n: number of predictions to return

    Returns:
        List of dictionaries containing:
            disease
            probability
    """

    # --------------------------------------------------------
    # Clean user symptoms
    # --------------------------------------------------------

    cleaned_symptoms = []

    for symptom in symptoms:

        if symptom is None:
            continue

        symptom = str(symptom).strip().lower()

        # Remove extra spaces
        symptom = " ".join(
            symptom.split()
        )

        if symptom:
            cleaned_symptoms.append(symptom)

    # Remove duplicate symptoms
    cleaned_symptoms = sorted(
        set(cleaned_symptoms)
    )

    if len(cleaned_symptoms) == 0:
        return {
            "success": False,
            "message": "Please provide at least one symptom.",
            "predictions": []
        }

    # --------------------------------------------------------
    # Check which symptoms are known to the model
    # --------------------------------------------------------

    known_symptoms = set(
        symptom_encoder.classes_
    )

    valid_symptoms = [
        symptom
        for symptom in cleaned_symptoms
        if symptom in known_symptoms
    ]

    unknown_symptoms = [
        symptom
        for symptom in cleaned_symptoms
        if symptom not in known_symptoms
    ]

    # If none of the symptoms are known
    if len(valid_symptoms) == 0:

        return {
            "success": False,
            "message": (
                "None of the entered symptoms are "
                "recognized by the trained model."
            ),
            "predictions": [],
            "unknown_symptoms": unknown_symptoms
        }

    # --------------------------------------------------------
    # Encode symptoms
    # --------------------------------------------------------

    X = symptom_encoder.transform(
        [valid_symptoms]
    )

    # --------------------------------------------------------
    # Get probability for every disease
    # --------------------------------------------------------

    probabilities = model.predict_proba(X)[0]

    # --------------------------------------------------------
    # Get top N predictions
    # --------------------------------------------------------

    top_n = min(
        top_n,
        len(probabilities)
    )

    top_indices = np.argsort(
        probabilities
    )[::-1][:top_n]

    predictions = []

    for index in top_indices:

        disease = label_encoder.inverse_transform(
            [index]
        )[0]

        probability = float(
            probabilities[index]
        )

        predictions.append({
            "disease": disease,
            "probability": round(
                probability * 100,
                2
            )
        })

    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {
        "success": True,
        "input_symptoms": cleaned_symptoms,
        "recognized_symptoms": valid_symptoms,
        "unknown_symptoms": unknown_symptoms,
        "predictions": predictions
    }


# ============================================================
# 4. TEST THE MODEL
# ============================================================

def get_supported_symptoms():
    """Return the symptom names supported by the trained encoder."""
    return sorted(
        str(symptom)
        for symptom in symptom_encoder.classes_
    )


if __name__ == "__main__":

    print("\n" + "=" * 60)
    print("MedIntel AI - Prediction Test")
    print("=" * 60)

    test_symptoms = [
        "itching",
        "skin rash",
        "nodal skin eruptions"
    ]

    print("\nTest symptoms:")

    for symptom in test_symptoms:
        print(f"  - {symptom}")

    result = predict_disease(
        test_symptoms,
        top_n=3
    )

    print("\nPrediction Results:")
    print("-" * 40)

    if result["success"]:

        for rank, prediction in enumerate(
            result["predictions"],
            start=1
        ):

            print(
                f"{rank}. "
                f"{prediction['disease']} "
                f"-> "
                f"{prediction['probability']}%"
            )

        if result["unknown_symptoms"]:

            print("\nUnrecognized symptoms:")

            for symptom in result["unknown_symptoms"]:
                print(f"  - {symptom}")

    else:

        print(
            f"Error: {result['message']}"
        )

    print("=" * 60)