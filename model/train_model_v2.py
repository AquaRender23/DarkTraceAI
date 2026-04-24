import pandas as pd
import numpy as np
import os
import joblib
import time

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
from xgboost import XGBClassifier

# =========================
# BASE PATH (IMPORTANT)
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

data_dir = os.path.join(BASE_DIR, "data")
models_dir = os.path.join(BASE_DIR, "models")
os.makedirs(models_dir, exist_ok=True)

start_time = time.time()

# =========================
# 1. LOAD DATA
# =========================
print("📂 [1/7] Loading dataset files...")

files = [os.path.join(data_dir, f) for f in os.listdir(data_dir) if f.endswith(".csv")]

if not files:
    print("❌ No CSV files found in 'data' folder!")
    exit()

df_list = []

for i, file in enumerate(files):
    print(f"   ➡️ ({i+1}/{len(files)}) Reading: {os.path.basename(file)}")
    temp = pd.read_csv(file)
    temp.columns = temp.columns.str.strip()
    df_list.append(temp)

print("🔗 Concatenating dataframes...")
df = pd.concat(df_list, ignore_index=True)
print(f"📊 Raw Dataset Shape: {df.shape}")

# =========================
# 2. CLEAN DATA
# =========================
print("\n🧹 [2/7] Cleaning data...")

initial_rows = len(df)

df.replace([np.inf, -np.inf], np.nan, inplace=True)
df.dropna(inplace=True)

print(f"✅ Removed {initial_rows - len(df)} bad rows")
print(f"📊 Cleaned Dataset Shape: {df.shape}")

# =========================
# 3. SPLIT FEATURES & LABEL
# =========================
print("\n🎯 [3/7] Separating Features and Labels...")

X = df.drop("Label", axis=1)
y = df["Label"]

# 🔥 IMPORTANT: Fix datatype issues
X = X.apply(pd.to_numeric, errors='coerce')
X.dropna(inplace=True)
y = y.loc[X.index]

# Save feature names
feature_names = X.columns.tolist()
joblib.dump(feature_names, os.path.join(models_dir, "features_v2.pkl"))

print(f"📝 {len(feature_names)} features recorded")

# =========================
# 4. ENCODE LABELS
# =========================
print("\n🔤 [4/7] Encoding labels...")

le = LabelEncoder()
y_encoded = le.fit_transform(y)

joblib.dump(le, os.path.join(models_dir, "label_encoder_v2.pkl"))

print("📋 Class distribution:")
for label, count in zip(le.classes_, np.bincount(y_encoded)):
    print(f"   - {label}: {count}")

# =========================
# 5. TRAIN-TEST SPLIT
# =========================
print("\n🔀 [5/7] Splitting data...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

print(f"✅ Training samples: {len(X_train)}")

# =========================
# 6. TRAIN MODEL
# =========================
print("\n🚀 [6/7] Training XGBoost model...")

model = XGBClassifier(
    n_estimators=150,
    max_depth=8,
    learning_rate=0.1,
    tree_method='hist',
    eval_metric='mlogloss',
    verbosity=1
)

train_start = time.time()
model.fit(X_train, y_train)
train_end = time.time()

print(f"✅ Training completed in {round(train_end - train_start, 2)} seconds")

# =========================
# 7. EVALUATE
# =========================
print("\n📈 [7/7] Evaluating model...")

y_pred = model.predict(X_test)

print("\n" + "="*40)
print("FINAL CLASSIFICATION REPORT")
print("="*40)
print(classification_report(y_test, y_pred, target_names=le.classes_))

# =========================
# 8. SAVE MODEL
# =========================
print("\n💾 Saving model...")

model.save_model(os.path.join(models_dir, "xgboost_model_v2.json"))

total_time = time.time() - start_time

print("\n🎉 ALL DONE!")
print(f"⏱ Total time: {round(total_time, 2)} seconds")
print("📦 Files saved in /model/models/")