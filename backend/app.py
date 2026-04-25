from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask import render_template
from flask_socketio import SocketIO, emit  # <-- ADDED 'emit' HERE
from xgboost import XGBClassifier
import joblib
import os
import pandas as pd
import numpy as np

app = Flask(__name__, 
            template_folder="../templates",
            static_folder="../static")
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# =========================
# LOAD MODEL V4 (FIXED)
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(BASE_DIR, "../model/models/model_v4.json")
le_path = os.path.join(BASE_DIR, "../model/models/label_encoder_v4.pkl")
features_path = os.path.join(BASE_DIR, "../model/models/features_v4.pkl")

model = XGBClassifier()
model.load_model(model_path)

label_encoder = joblib.load(le_path)
feature_template = joblib.load(features_path)

print("✅ Model v4 loaded!")
print("📊 Features:", feature_template)


@app.route('/')
def home():
    return render_template('home.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/report')
def report():
    return render_template('report.html')


@app.route('/history')
def history():
    return render_template('history.html')


@app.route('/firewall')
def firewall():
    return render_template('firewall.html')


@app.route('/threat')
def threat():
    return render_template('threat.html')


@app.route('/about')
def about():
    return render_template('about.html')

# =========================
# ANALYZE API
# =========================
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        features = data.get("features")

        if not features:
            return jsonify({"error": "No features provided"}), 400

        # Convert to DataFrame
        df = pd.DataFrame([features])

        # Ensure all required features exist
        for col in feature_template:
            if col not in df.columns:
                df[col] = 0

        df = df[feature_template]

        # Fix data types
        df = df.apply(pd.to_numeric, errors='coerce')
        df.fillna(0, inplace=True)

        # 🔥 Prediction
        pred_idx = model.predict(df)
        pred_idx = np.array(pred_idx).reshape(-1)

        prediction = label_encoder.inverse_transform(pred_idx)[0]

        # Confidence
        proba = model.predict_proba(df)
        confidence = float(np.max(proba))

        # Attack logic
        is_attack = str(prediction).lower() != "benign"

        print(f"🚨 {prediction} ({round(confidence*100,2)}%)")

        return jsonify({
            "prediction": str(prediction),
            "confidence": round(confidence * 100, 2),
            "is_attack": is_attack
        })

    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({"error": str(e)}), 500
    

@app.route('/vis')
def vis():
    return send_from_directory(os.path.join(BASE_DIR, '../simulation'), 'vis.html')
    
@app.route('/telemetry')
def telemetry():
    return send_from_directory(os.path.join(BASE_DIR, '../simulation'), 'telemetry.html')

# =========================
# SOCKET
# =========================
@socketio.on('connect')
def handle_connect():
    print("🔌 UI Connected")

# <-- ADDED THIS RELAY FUNCTION -->
@socketio.on('omni_sync')
def handle_omni_sync(data):
    # This acts as a bridge: when telemetry sends a command, 
    # it broadcasts it to the visualizer (and vice versa)
    emit('omni_sync', data, broadcast=True, include_self=False)

# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    print("🚀 Backend running on port 5001...")
    socketio.run(app, port=5001, debug=True)