import os
import pandas as pd
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# =========================
# LOAD DATA
# =========================
data_folder = "data"
df_list = []

for file in os.listdir(data_folder):
    if file.endswith(".csv"):
        print("📂 Loading:", file)
        df_list.append(pd.read_csv(os.path.join(data_folder, file)))

df = pd.concat(df_list, ignore_index=True)

# Clean column names
df.columns = df.columns.str.strip()

print("✅ Data loaded:", len(df))


# =========================
# FIX LABELS
# =========================
if "Label" not in df.columns:
    raise Exception("❌ Label column missing")

df["Label"] = df["Label"].astype(str).str.strip()

print("✅ Labels:", df["Label"].unique()[:10])


# =========================
# FEATURES
# =========================
base_features = [
    'Flow Duration',
    'Total Fwd Packets',
    'Total Backward Packets',
    'Flow Bytes/s',
    'Flow Packets/s',
    'SYN Flag Count',
    'ACK Flag Count',
    'Packet Length Mean'
]

for col in base_features:
    if col not in df.columns:
        df[col] = 0


# =========================
# DERIVED FEATURES
# =========================
df['Packet Rate Ratio'] = df['Flow Packets/s'] / (df['Flow Duration'] + 1)
df['Byte Rate Ratio'] = df['Flow Bytes/s'] / (df['Flow Duration'] + 1)
df['Fwd/Bwd Ratio'] = df['Total Fwd Packets'] / (df['Total Backward Packets'] + 1)
df['Avg Bytes per Packet'] = df['Flow Bytes/s'] / (df['Flow Packets/s'] + 1)
df['SYN/ACK Ratio'] = df['SYN Flag Count'] / (df['ACK Flag Count'] + 1)
df['Traffic Intensity'] = df['Flow Bytes/s'] * df['Flow Packets/s']
df['Burst Indicator'] = df['Flow Packets/s'] / (df['Flow Duration'] + 1)
df['Packet Density'] = (df['Total Fwd Packets'] + df['Total Backward Packets']) / (df['Flow Duration'] + 1)
df['Anomaly Score'] = df['SYN Flag Count'] * df['Flow Packets/s']
df['Payload Indicator'] = df['Packet Length Mean'] * df['Flow Packets/s']

print("✅ Features created")


# =========================
# 🔥 BALANCE DATASET (FIX)
# =========================
print("\n📊 Before balancing:")
print(df["Label"].value_counts())

min_count = df["Label"].value_counts().min()

df_balanced = pd.concat([
    df[df["Label"] == label].sample(min_count, random_state=42)
    for label in df["Label"].unique()
])

df_balanced = df_balanced.sample(frac=1, random_state=42)

print("\n📊 After balancing:")
print(df_balanced["Label"].value_counts())


# =========================
# PREPARE X & y
# =========================
features = base_features + [
    'Packet Rate Ratio',
    'Byte Rate Ratio',
    'Fwd/Bwd Ratio',
    'Avg Bytes per Packet',
    'SYN/ACK Ratio',
    'Traffic Intensity',
    'Burst Indicator',
    'Packet Density',
    'Anomaly Score',
    'Payload Indicator'
]

X = df_balanced[features]
y = df_balanced["Label"]

# Clean features
X = X.apply(pd.to_numeric, errors='coerce')
X.fillna(0, inplace=True)
X.replace([float('inf'), float('-inf')], 0, inplace=True)
X = X.clip(lower=-1e6, upper=1e6)

print("✅ X ready")


# =========================
# ENCODE LABELS
# =========================
le = LabelEncoder()
y_encoded = le.fit_transform(y)

print("✅ Classes:", le.classes_)


# =========================
# TRAIN MODEL
# =========================
model = XGBClassifier(
    n_estimators=120,
    max_depth=5,
    learning_rate=0.1
)

print("🚀 Training...")
model.fit(X, y_encoded)

print("✅ Training complete")


# =========================
# SAVE
# =========================
os.makedirs("models", exist_ok=True)

model.save_model("models/model_v4.json")
joblib.dump(le, "models/label_encoder_v4.pkl")
joblib.dump(features, "models/features_v4.pkl")

print("🔥 MODEL V4 READY")