import os
import joblib
import numpy as np
import pandas as pd

from sklearn.preprocessing import MultiLabelBinarizer, LabelEncoder
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report
)


# ============================================================
# 1. PATHS
# ============================================================

# Folder containing this train_model.py file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Dataset
DATA_PATH = os.path.join(BASE_DIR, "Healthcare.csv")

# Folder where trained models will be saved
MODEL_DIR = os.path.join(BASE_DIR, "model")

os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# 2. LOAD DATASET
# ============================================================

print("=" * 60)
print("MedIntel AI - Disease Prediction Model Training")
print("=" * 60)

print("\nLoading dataset...")

if not os.path.exists(DATA_PATH):
    print("\nERROR: Healthcare.csv was not found.")
    print(f"Expected location:\n{DATA_PATH}")
    print("\nMake sure Healthcare.csv is inside the ml folder.")
    exit()

df = pd.read_csv(DATA_PATH)

print(f"Dataset loaded successfully.")
print(f"Rows: {len(df)}")
print(f"Columns: {len(df.columns)}")


# ============================================================
# 3. CHECK REQUIRED COLUMNS
# ============================================================

if "Disease" not in df.columns:
    print("\nERROR: 'Disease' column was not found in the dataset.")
    print("Available columns:")
    print(df.columns.tolist())
    exit()


# Find all symptom columns automatically
symptom_columns = [
    column for column in df.columns
    if column.lower().startswith("symptom_")
]

if len(symptom_columns) == 0:
    print("\nERROR: No Symptom_ columns were found.")
    print("Expected columns such as:")
    print("Symptom_1, Symptom_2, ..., Symptom_17")
    exit()

print(f"\nDisease column: Disease")
print(f"Symptom columns found: {len(symptom_columns)}")

print("\nSymptom columns:")
for column in symptom_columns:
    print(f"  - {column}")


# ============================================================
# 4. CLEAN SYMPTOMS
# ============================================================

print("\nCleaning symptom data...")


def clean_symptom(value):
    """
    Cleans one symptom value.

    Example:
        ' Fever ' -> 'fever'
        'Chest Pain' -> 'chest pain'
        NaN -> None
    """

    if pd.isna(value):
        return None

    value = str(value).strip().lower()

    # Remove extra spaces
    value = " ".join(value.split())

    if value == "":
        return None

    return value


def create_symptom_list(row):
    """
    Creates a unique list of symptoms for one patient.
    """

    symptoms = []

    for column in symptom_columns:
        symptom = clean_symptom(row[column])

        if symptom is not None:
            symptoms.append(symptom)

    # Remove duplicate symptoms within the same row
    return sorted(set(symptoms))


df["Symptom_List"] = df.apply(create_symptom_list, axis=1)


# ============================================================
# 5. REMOVE ROWS WITH NO SYMPTOMS
# ============================================================

before_count = len(df)

df = df[df["Symptom_List"].apply(len) > 0].copy()

removed_count = before_count - len(df)

if removed_count > 0:
    print(f"\nRemoved {removed_count} rows with no symptoms.")


# ============================================================
# 6. CLEAN DISEASE NAMES
# ============================================================

df["Disease"] = (
    df["Disease"]
    .astype(str)
    .str.strip()
    .str.lower()
)

print(f"\nNumber of diseases: {df['Disease'].nunique()}")


# ============================================================
# 7. CREATE SYMPTOM COMBINATION
# ============================================================

"""
A symptom combination is used as a group.

Example:

fever + cough + fatigue

will always belong to the same group.

This prevents identical symptom combinations from appearing
in both training and testing data, which could artificially
increase accuracy.
"""

df["Symptom_Key"] = df["Symptom_List"].apply(
    lambda symptoms: "||".join(symptoms)
)


# ============================================================
# 8. DATASET INFORMATION
# ============================================================

print("\n" + "=" * 60)
print("DATASET INFORMATION")
print("=" * 60)

print(f"Total usable records: {len(df)}")
print(f"Unique diseases: {df['Disease'].nunique()}")
print(f"Unique symptoms: {len(set(
    symptom
    for symptoms in df['Symptom_List']
    for symptom in symptoms
))}")
print(f"Unique symptom combinations: {df['Symptom_Key'].nunique()}")


# ============================================================
# 9. CHECK AMBIGUOUS SYMPTOM COMBINATIONS
# ============================================================

"""
If exactly the same symptoms are associated with different
diseases, a symptom-only model cannot always distinguish them.

We report this so the model evaluation is honest.
"""

combination_disease_counts = (
    df.groupby("Symptom_Key")["Disease"]
    .nunique()
)

ambiguous_combinations = combination_disease_counts[
    combination_disease_counts > 1
]

print(
    f"Symptom combinations associated with multiple diseases: "
    f"{len(ambiguous_combinations)}"
)

if len(ambiguous_combinations) > 0:
    print(
        "WARNING: Some identical symptom combinations have "
        "multiple disease labels."
    )
    print(
        "This can limit the maximum achievable accuracy."
    )


# ============================================================
# 10. ENCODE SYMPTOMS
# ============================================================

print("\nEncoding symptoms...")

multi_label_encoder = MultiLabelBinarizer()

X = multi_label_encoder.fit_transform(
    df["Symptom_List"]
)


# ============================================================
# 11. ENCODE DISEASES
# ============================================================

print("Encoding diseases...")

label_encoder = LabelEncoder()

y = label_encoder.fit_transform(
    df["Disease"]
)


# ============================================================
# 12. SHOW ENCODING INFORMATION
# ============================================================

print(f"\nFeature count: {X.shape[1]}")
print(f"Number of disease classes: {len(label_encoder.classes_)}")

print("\nDiseases:")
for index, disease in enumerate(label_encoder.classes_):
    print(f"{index}: {disease}")


# ============================================================
# 13. GROUP-AWARE TRAIN/TEST SPLIT
# ============================================================

# ============================================================
# 13. STRATIFIED GROUP-AWARE TRAIN/TEST SPLIT
# ============================================================

print("\nCreating stratified group-aware train/test split...")

"""
We need two things:

1. Identical symptom combinations must stay together.
   This prevents duplicate symptom combinations from
   appearing in both training and testing data.

2. The test set should contain as many disease classes
   as possible.

StratifiedGroupKFold helps us achieve both.
"""

groups = df["Symptom_Key"]

splitter = StratifiedGroupKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

best_split = None
best_test_class_count = -1
best_size_difference = float("inf")

for fold_number, (train_indices, test_indices) in enumerate(
    splitter.split(X, y, groups),
    start=1
):

    test_classes = set(y[test_indices])

    test_size = len(test_indices) / len(X)

    # We want approximately 20% test data
    size_difference = abs(test_size - 0.20)

    # Prefer a split containing more disease classes
    # and approximately 20% test data.
    if (
        len(test_classes) > best_test_class_count
        or (
            len(test_classes) == best_test_class_count
            and size_difference < best_size_difference
        )
    ):
        best_test_class_count = len(test_classes)
        best_size_difference = size_difference

        best_split = (
            train_indices,
            test_indices
        )

    print(
        f"Fold {fold_number}: "
        f"train={len(train_indices)}, "
        f"test={len(test_indices)}, "
        f"test diseases={len(test_classes)}"
    )


# Use the best available split
train_indices, test_indices = best_split

X_train = X[train_indices]
X_test = X[test_indices]

y_train = y[train_indices]
y_test = y[test_indices]

print("\nSelected split:")
print(f"Training records: {len(X_train)}")
print(f"Testing records: {len(X_test)}")
print(
    f"Training diseases: {len(set(y_train))} / "
    f"{len(label_encoder.classes_)}"
)
print(
    f"Testing diseases: {len(set(y_test))} / "
    f"{len(label_encoder.classes_)}"
)

if len(set(y_test)) < len(label_encoder.classes_):
    print(
        "\nWARNING: Not every disease could be represented "
        "in the selected test split."
    )
else:
    print(
        "\nSUCCESS: All diseases are represented in "
        "the test set."
    )


# ============================================================
# 14. CHECK CLASS DISTRIBUTION
# ============================================================

train_classes = set(y_train)
test_classes = set(y_test)
all_classes = set(range(len(label_encoder.classes_)))

missing_from_train = all_classes - train_classes
missing_from_test = all_classes - test_classes

if missing_from_train:
    print("\nWARNING:")
    print(
        "Some diseases are missing from the training split:"
    )

    for class_index in sorted(missing_from_train):
        print(
            f"  - {label_encoder.classes_[class_index]}"
        )

if missing_from_test:
    print("\nNote:")
    print(
        "Some diseases are not present in the testing split."
    )


# ============================================================
# 15. CREATE MACHINE LEARNING MODELS
# ============================================================

print("\n" + "=" * 60)
print("CREATING MACHINE LEARNING MODELS")
print("=" * 60)

models = {

    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        n_jobs=-1
    ),

    "Decision Tree": DecisionTreeClassifier(
        random_state=42
    ),

    "Naive Bayes": MultinomialNB(),

    "KNN": KNeighborsClassifier(
        n_neighbors=5
    )
}


# ============================================================
# 16. TRAIN AND EVALUATE MODELS
# ============================================================

results = {}

best_model = None
best_model_name = None
best_f1 = -1

print("\nTraining models...\n")

for model_name, model in models.items():

    print("-" * 60)
    print(f"Training: {model_name}")

    # Train
    model.fit(X_train, y_train)

    # Predict
    y_pred = model.predict(X_test)

    # Metrics
    accuracy = accuracy_score(
        y_test,
        y_pred
    )

    precision = precision_score(
        y_test,
        y_pred,
        average="weighted",
        zero_division=0
    )

    recall = recall_score(
        y_test,
        y_pred,
        average="weighted",
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        y_pred,
        average="weighted",
        zero_division=0
    )

    results[model_name] = {
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1_Score": f1
    }

    print(f"Accuracy : {accuracy * 100:.2f}%")
    print(f"Precision: {precision * 100:.2f}%")
    print(f"Recall   : {recall * 100:.2f}%")
    print(f"F1 Score : {f1 * 100:.2f}%")

    # Select best model using weighted F1 score
    if f1 > best_f1:
        best_f1 = f1
        best_model = model
        best_model_name = model_name


# ============================================================
# 17. MODEL COMPARISON
# ============================================================

print("\n" + "=" * 60)
print("MODEL COMPARISON")
print("=" * 60)

comparison_df = pd.DataFrame(results).T

comparison_df = comparison_df.sort_values(
    by="F1_Score",
    ascending=False
)

print(
    comparison_df.to_string(
        float_format=lambda value: f"{value * 100:.2f}%"
    )
)


# ============================================================
# 18. BEST MODEL
# ============================================================

print("\n" + "=" * 60)
print("BEST MODEL")
print("=" * 60)

print(f"Best model: {best_model_name}")
print(f"Weighted F1 Score: {best_f1 * 100:.2f}%")


# ============================================================
# 19. CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 60)
print("CLASSIFICATION REPORT")
print("=" * 60)

best_predictions = best_model.predict(X_test)

all_label_indices = np.arange(
    len(label_encoder.classes_)
)

print(
    classification_report(
        y_test,
        best_predictions,
        labels=all_label_indices,
        target_names=label_encoder.classes_,
        zero_division=0
    )
)


# ============================================================
# 20. TRAIN BEST MODEL ON COMPLETE DATASET
# ============================================================

"""
After evaluating the algorithms, we retrain the selected
algorithm using ALL available records.

This gives the final model the maximum amount of training
data before it is used by Flask.
"""

print("\n" + "=" * 60)
print("TRAINING FINAL MODEL")
print("=" * 60)

print(
    f"Retraining {best_model_name} using all "
    f"{len(X)} records..."
)

final_model = models[best_model_name]

final_model.fit(
    X,
    y
)

print("Final model training completed.")


# ============================================================
# 21. SAVE MODEL
# ============================================================

model_path = os.path.join(
    MODEL_DIR,
    "disease_model.pkl"
)

symptom_encoder_path = os.path.join(
    MODEL_DIR,
    "symptom_encoder.pkl"
)

label_encoder_path = os.path.join(
    MODEL_DIR,
    "label_encoder.pkl"
)

comparison_path = os.path.join(
    MODEL_DIR,
    "model_comparison.csv"
)

symptoms_path = os.path.join(
    MODEL_DIR,
    "symptoms.csv"
)

metadata_path = os.path.join(
    MODEL_DIR,
    "model_metadata.pkl"
)


# Save final model
joblib.dump(
    final_model,
    model_path
)

# Save symptom encoder
joblib.dump(
    multi_label_encoder,
    symptom_encoder_path
)

# Save disease label encoder
joblib.dump(
    label_encoder,
    label_encoder_path
)

# Save model comparison
comparison_df.to_csv(
    comparison_path
)

# Save symptom list
symptoms_df = pd.DataFrame({
    "symptom": multi_label_encoder.classes_
})

symptoms_df.to_csv(
    symptoms_path,
    index=False
)

# Save useful metadata
metadata = {
    "best_model": best_model_name,
    "number_of_records": len(df),
    "number_of_diseases": len(label_encoder.classes_),
    "number_of_symptoms": len(multi_label_encoder.classes_),
    "symptom_columns": symptom_columns,
    "evaluation_split": "GroupShuffleSplit",
    "test_size": 0.20,
    "random_state": 42
}

joblib.dump(
    metadata,
    metadata_path
)


# ============================================================
# 22. FINAL OUTPUT
# ============================================================

print("\n" + "=" * 60)
print("TRAINING COMPLETED SUCCESSFULLY")
print("=" * 60)

print("\nBest model:")
print(f"  {best_model_name}")

print("\nFiles saved:")

print(f"  {model_path}")
print(f"  {symptom_encoder_path}")
print(f"  {label_encoder_path}")
print(f"  {comparison_path}")
print(f"  {symptoms_path}")
print(f"  {metadata_path}")

print("\nMedIntel AI disease prediction model is ready.")
print("=" * 60)