"""
Production Machine Learning Training, Model Comparison, and Serialization Pipeline
AGRISENSE Agriculture Intelligence Platform
"""

import json
import time
from datetime import datetime
from pathlib import Path
# pyrefly: ignore [missing-import]
import joblib
# pyrefly: ignore [missing-import]
import numpy as np
import pandas as pd

from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
import xgboost as xgb

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "datasets" / "crop_recommendation_extended.csv"
SAVED_MODELS_DIR = BASE_DIR / "saved_models"
EVALUATION_DIR = BASE_DIR / "evaluation"

SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
EVALUATION_DIR.mkdir(parents=True, exist_ok=True)

# Numeric features used in the core ML classification pipeline
NUMERIC_FEATURES = [
    "N", "P", "K", "temperature", "humidity", "ph", "rainfall",
    "soil_moisture", "solar_radiation", "wind_speed",
    "heatwave_risk", "drought_risk", "flood_risk", "frost_risk"
]

def run_training_pipeline():
    print("=" * 70)
    print("AGRISENSE ML PIPELINE: MODEL TRAINING & BENCHMARK COMPARISON")
    print("=" * 70)

    # 1. Load Data
    print(f"Loading extended agronomic dataset from {DATASET_PATH}...")
    df = pd.read_csv(DATASET_PATH)
    print(f"Dataset shape: {df.shape}")

    # Check for missing values
    null_counts = df[NUMERIC_FEATURES].isnull().sum().sum()
    if null_counts > 0:
        print(f"Imputing {null_counts} missing values with feature medians...")
        df[NUMERIC_FEATURES] = df[NUMERIC_FEATURES].fillna(df[NUMERIC_FEATURES].median())

    X = df[NUMERIC_FEATURES].values
    y_raw = df["crop"].values

    # Encode target labels
    le = LabelEncoder()
    y = le.fit_transform(y_raw)
    class_names = le.classes_.tolist()
    print(f"Target classes ({len(class_names)}): {class_names}")

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Stratified Train/Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")

    # 2. Define Model Candidates for Rigorous Comparison
    models = {
        "Random Forest": RandomForestClassifier(
            n_estimators=150, max_depth=16, min_samples_split=3, random_state=42, n_jobs=-1
        ),
        "XGBoost": xgb.XGBClassifier(
            n_estimators=120, max_depth=6, learning_rate=0.08, eval_metric="mlogloss", random_state=42, n_jobs=-1
        ),
        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42
        ),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=14, min_samples_split=4, random_state=42
        ),
        "Support Vector Machine": SVC(
            kernel="rbf", C=10.0, probability=True, random_state=42
        )
    }

    comparison_results = []
    trained_models = {}
    best_model_name = None
    best_val_score = -1.0

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    print("\nEvaluating Algorithm Candidates with 5-Fold Stratified Cross-Validation:")
    print("-" * 70)

    for name, model in models.items():
        start_time = time.time()
        cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="accuracy")
        mean_cv = float(cv_scores.mean())
        std_cv = float(cv_scores.std())

        # Fit model on training set
        model.fit(X_train, y_train)
        train_time = time.time() - start_time

        # Test set evaluation
        y_pred = model.predict(X_test)
        test_acc = float(accuracy_score(y_test, y_pred))
        test_f1 = float(f1_score(y_test, y_pred, average="weighted"))
        test_prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
        test_rec = float(recall_score(y_test, y_pred, average="weighted"))

        print(f"[{name}]")
        print(f"   5-Fold CV Accuracy: {mean_cv*100:.2f}% (± {std_cv*100:.2f}%)")
        print(f"   Test Accuracy:      {test_acc*100:.2f}% | F1-Score: {test_f1:.4f}")
        print(f"   Training Time:      {train_time:.2f}s")

        res_entry = {
            "model_name": name,
            "cv_accuracy_mean": round(mean_cv, 4),
            "cv_accuracy_std": round(std_cv, 4),
            "test_accuracy": round(test_acc, 4),
            "test_precision": round(test_prec, 4),
            "test_recall": round(test_rec, 4),
            "test_f1": round(test_f1, 4),
            "training_time_seconds": round(train_time, 2)
        }
        comparison_results.append(res_entry)
        trained_models[name] = model

        if mean_cv > best_val_score:
            best_val_score = mean_cv
            best_model_name = name

    print("-" * 70)
    print(f"SELECTED CHAMPION MODEL: {best_model_name} (CV: {best_val_score*100:.2f}%)")

    champion_model = trained_models[best_model_name]
    y_test_pred = champion_model.predict(X_test)

    # Detailed Classification Report
    clf_report_dict = classification_report(y_test, y_test_pred, target_names=class_names, output_dict=True)
    conf_matrix = confusion_matrix(y_test, y_test_pred).tolist()

    # Feature Importance (if tree-based)
    feature_importances = {}
    if hasattr(champion_model, "feature_importances_"):
        fi = champion_model.feature_importances_
        for feat, imp in sorted(zip(NUMERIC_FEATURES, fi), key=lambda x: x[1], reverse=True):
            feature_importances[feat] = round(float(imp), 4)
    print("\nFeature Importances:")
    for feat, imp in feature_importances.items():
        print(f"   {feat:18s}: {imp:.4f}")

    # Model Versioning & Serialization
    version = f"v2.4.0-{datetime.now().strftime('%Y%m%d')}"
    model_path = SAVED_MODELS_DIR / "crop_recommendation_best.joblib"
    scaler_path = SAVED_MODELS_DIR / "scaler.joblib"
    encoder_path = SAVED_MODELS_DIR / "label_encoder.joblib"
    metadata_path = SAVED_MODELS_DIR / "model_metadata.json"

    joblib.dump(champion_model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(le, encoder_path)

    metadata = {
        "version": version,
        "champion_model": best_model_name,
        "created_at": datetime.now().isoformat(),
        "input_features": NUMERIC_FEATURES,
        "classes": class_names,
        "num_classes": len(class_names),
        "dataset_records": len(df),
        "test_records": len(X_test),
        "metrics": {
            "cv_accuracy_mean": next(r["cv_accuracy_mean"] for r in comparison_results if r["model_name"] == best_model_name),
            "test_accuracy": next(r["test_accuracy"] for r in comparison_results if r["model_name"] == best_model_name),
            "test_precision": next(r["test_precision"] for r in comparison_results if r["model_name"] == best_model_name),
            "test_recall": next(r["test_recall"] for r in comparison_results if r["model_name"] == best_model_name),
            "test_f1": next(r["test_f1"] for r in comparison_results if r["model_name"] == best_model_name),
        },
        "model_comparison": comparison_results,
        "feature_importances": feature_importances,
        "classification_report": {k: v for k, v in clf_report_dict.items() if k not in ["macro avg", "weighted avg", "accuracy"]},
        "confusion_matrix_summary": {
            "total_correct": int(np.trace(conf_matrix)),
            "total_samples": int(len(X_test))
        }
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    # Save evaluation report artifact
    eval_report_path = EVALUATION_DIR / "model_evaluation_report.json"
    with open(eval_report_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nArtifacts successfully serialized:")
    print(f" - Model: {model_path}")
    print(f" - Scaler: {scaler_path}")
    print(f" - Encoder: {encoder_path}")
    print(f" - Metadata: {metadata_path}")
    print("=" * 70)

if __name__ == "__main__":
    run_training_pipeline()
