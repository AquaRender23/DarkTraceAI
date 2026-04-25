# DarkTraceAI 🛡️

An AI-powered cybersecurity dashboard that detects, classifies, and visualizes network threats in real-time using machine learning.

## Overview

DarkTraceAI is a full-stack cybersecurity simulation platform built with Flask and XGBoost. It features a live attack simulation engine, a real-time SOC-style dashboard, and an ML model trained on the CIC-IDS-2017 dataset to classify 14+ attack types.

## Features

- 🤖 **ML Threat Detection** — XGBoost classifier trained on CIC-IDS-2017 network traffic data
- 📊 **Live Dashboard** — Real-time stats, attack trends, firewall events, and threat maps
- 🔴 **Attack Simulator** — Scripted attacker engine that fires payloads over Socket.IO
- 🧱 **Firewall View** — Traffic overview, blocked IPs, zone distribution
- 📋 **Threat Logs** — Filterable, exportable table of detected threats
- 📄 **Report Page** — Per-scan summary with confidence score and recommendations

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, Flask, Flask-SocketIO |
| ML Model | XGBoost, scikit-learn, pandas |
| Frontend | HTML, CSS, JavaScript, Chart.js |
| Simulation | Socket.IO, threading |
| Dataset | CIC-IDS-2017 |

## Project Structure

```
DarkTraceAI/
├── backend/
│   └── app.py                  # Main Flask app + Socket.IO server
├── model/
│   ├── train_model_v4.py       # Model training script
│   ├── predict_v2.py           # Batch prediction + accuracy test
│   └── models/                 # Saved model artifacts (.json, .pkl)
├── attacker/
│   ├── omni_attacker_pro.py    # Attack simulation client
│   └── generate_cic_ammo.py   # CIC-IDS-2017 payload generator
├── simulation/
│   ├── server.py               # Simulation backend (port 5000)
│   ├── TelemetryEngine.js
│   └── telemetryWorker.js
├── templates/                  # Jinja2 HTML templates
├── static/                     # CSS, JS, images
└── README.md
```

## Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/DarkTraceAI.git
cd DarkTraceAI
```

### 2. Install dependencies
```bash
pip install flask flask-cors flask-socketio xgboost scikit-learn pandas numpy joblib
```

### 3. Train the model (optional — pretrained models included)
```bash
cd model
python train_model_v4.py
```
> Place CIC-IDS-2017 CSV files in `model/data/` before training.

### 4. Run the backend
```bash
cd backend
python app.py
```
App runs at `http://127.0.0.1:5001`

### 5. Run the attack simulator (optional)
```bash
# Terminal 2 — generate attack payloads
cd attacker
python generate_cic_ammo.py

# Terminal 3 — launch the attacker
python omni_attacker_pro.py
```

## ML Model Details

- **Algorithm:** XGBoost Classifier
- **Dataset:** CIC-IDS-2017 (Canadian Institute for Cybersecurity)
- **Classes:** BENIGN, DDoS, DoS Hulk, DoS GoldenEye, DoS Slowloris, DoS Slowhttptest, FTP-Patator, SSH-Patator, Web Attack – Brute Force, Web Attack – XSS, Web Attack – SQL Injection, PortScan, Bot, Infiltration, Heartbleed
- **Features:** 18 engineered features including flow duration, packet rates, SYN/ACK ratios, and traffic intensity metrics
- **Balancing:** Undersampling to equal class counts before training

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Dashboard home |
| POST | `/analyze` | Predict attack type from network features |
| GET | `/report` | Report summary page |
| GET | `/firewall` | Firewall dashboard |
| GET | `/threat` | Threat logs page |
| GET | `/history` | Activity history |
| GET | `/telemetry` | Live simulation view |

### Example `/analyze` Request
```json
POST /analyze
{
  "features": {
    "Flow Duration": 1200,
    "Total Fwd Packets": 50,
    "Flow Bytes/s": 8500.0
  }
}
```

### Example Response
```json
{
  "prediction": "DDoS",
  "confidence": 97.43,
  "is_attack": true
}
```

## Dataset

This project uses the [CIC-IDS-2017 dataset](https://www.unb.ca/cic/datasets/ids-2017.html) from the Canadian Institute for Cybersecurity. Download the CSV files and place them in `model/data/`.
