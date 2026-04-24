from flask import Flask, request, jsonify
from flask_cors import CORS
from xgboost import XGBClassifier
import joblib
import os
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

# =========================
# SECURITY MODULES (for UI / simulation)
# =========================
SECURITY_MODULES = [
    {"id": "intel", "name": "Threat Intel"},
    {"id": "cloud", "name": "Cloud Scrub"},
    {"id": "cspm", "name": "CSPM Monitor"},
    {"id": "waf", "name": "Web App FW"},
    {"id": "edge", "name": "Edge NGFW"},
    {"id": "nta", "name": "Network NTA"},
    {"id": "ips", "name": "IPS Engine"},
    {"id": "soar", "name": "SOAR Matrix"},
    {"id": "sandbox", "name": "AV Sandbox"},
    {"id": "xdr", "name": "XDR Engine"},
    {"id": "dlp", "name": "DLP Gateway"},
    {"id": "deception", "name": "Decept Grid"},
    {"id": "ztna", "name": "ZTNA Access"},
    {"id": "core", "name": "Core Auth"}
]

# =========================
# LOAD MODEL
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


model_path = os.path.join(BASE_DIR, "../model/models/xgboost_model_v2.json")
le_path = os.path.join(BASE_DIR, "../model/models/label_encoder_v2.pkl")
features_path = os.path.join(BASE_DIR, "../model/models/features_v2.pkl")

model = XGBClassifier()
model.load_model(model_path)

label_encoder = joblib.load(le_path)
training_features = joblib.load(features_path)

print("✅ Model loaded")

# =========================
# HEALTH CHECK (important for demo)
# =========================
@app.route('/')
def home():
    return {"status": "Backend running"}

# =========================
# ANALYZE API
# =========================
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        features = data.get("features")

        # ✅ VALIDATION
        if not features:
            return jsonify({"error": "No features provided"}), 400

        if len(features) != len(training_features):
            return jsonify({
                "error": f"Expected {len(training_features)} features"
            }), 400

        # Convert to DataFrame
        sample = pd.DataFrame([features], columns=training_features)

        # Prediction
        pred_idx = model.predict(sample)
        prediction = label_encoder.inverse_transform(pred_idx)[0]

        # Confidence
        proba = model.predict_proba(sample)
        confidence = float(np.max(proba))

        print(f"🚨 {prediction} ({round(confidence*100,2)}%)")

        return jsonify({
            "prediction": prediction,
            "confidence": round(confidence * 100, 2)
        })

    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000)