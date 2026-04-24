import pandas as pd
import joblib
import os
from xgboost import XGBClassifier

# =========================
# BASE PATH (IMPORTANT FIX)
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# =========================
# 1. LOAD MODEL
# =========================
print("📦 Loading model and artifacts...")

model_path = os.path.join(BASE_DIR, "models", "xgboost_model_v2.json")
le_path = os.path.join(BASE_DIR, "models", "label_encoder_v2.pkl")
features_path = os.path.join(BASE_DIR, "models", "features_v2.pkl")

if not os.path.exists(model_path):
    print("❌ Model not found! Run training first.")
    exit()

model = XGBClassifier()
model.load_model(model_path)

le = joblib.load(le_path)
training_features = joblib.load(features_path)

print("✅ Model loaded!")

# =========================
# 2. LOAD DATA
# =========================
print("\n📂 Loading dataset...")

data_folder = os.path.join(BASE_DIR, "data")
files = [os.path.join(data_folder, f) for f in os.listdir(data_folder) if f.endswith(".csv")]

df_list = []

for file in files:
    print(f"➡️ Reading: {os.path.basename(file)}")
    temp = pd.read_csv(file)
    temp.columns = temp.columns.str.strip()
    df_list.append(temp)

df = pd.concat(df_list, ignore_index=True)

print("✅ Data loaded!")
print("📊 Dataset shape:", df.shape)

# =========================
# 3. CLEAN + FIX TYPES (IMPORTANT FIX)
# =========================
print("\n🧹 Cleaning data...")

df = df.replace([float("inf"), float("-inf")], pd.NA)
df = df.dropna()

# Convert ALL columns to numeric (fix for object dtype error)
df = df.apply(pd.to_numeric, errors='coerce')
df = df.dropna()

print("✅ Data cleaned!")

# =========================
# 4. SELECT ATTACK SAMPLE
# =========================
print("\n🎯 Selecting attack sample...")

attack_df = df[df["Label"] != "BENIGN"]

if attack_df.empty:
    print("⚠️ No attack rows found, using random row.")
    row = df.sample(1)
else:
    row = attack_df.sample(1)

actual_label = row["Label"].values[0]

# =========================
# 5. ALIGN FEATURES
# =========================
print("🔧 Aligning features...")

sample_aligned = row[training_features]

# =========================
# 6. PREDICT
# =========================
print("\n🤖 Running prediction...")

prediction_idx = model.predict(sample_aligned)
detected_label = le.inverse_transform(prediction_idx)[0]

# =========================
# 7. OUTPUT
# =========================
print("\n" + "═"*40)
print(f"🎯 ACTUAL ATTACK:     {actual_label}")
print(f"🚨 DETECTED ATTACK:   {detected_label}")
print("═"*40)

if actual_label == detected_label:
    print("✅ MATCH — Correct detection")
else:
    print("❌ MISMATCH — Incorrect detection")

print("═"*40 + "\n")