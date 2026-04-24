import pandas as pd
import joblib
import os
from xgboost import XGBClassifier
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load model
print("📦 Loading model and artifacts...")
model = XGBClassifier()
model.load_model(os.path.join(BASE_DIR, "models", "xgboost_model_v2.json"))
le = joblib.load(os.path.join(BASE_DIR, "models", "label_encoder_v2.pkl"))
training_features = joblib.load(os.path.join(BASE_DIR, "models", "features_v2.pkl"))
print("✅ Model loaded!")

# Load data
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
print(f"✅ Data loaded! Shape: {df.shape}")

# Clean
print("\n🧹 Cleaning data...")
df = df.replace([float("inf"), float("-inf")], pd.NA)
label_col = df["Label"].copy()
feature_cols = [col for col in df.columns if col != "Label"]
df[feature_cols] = df[feature_cols].apply(pd.to_numeric, errors='coerce')
df["Label"] = label_col
df = df.dropna(subset=feature_cols)
print("✅ Data cleaned!")
print(f"📊 Unique labels found: {sorted(df['Label'].unique())}")

# ============================
# TEST 5 SAMPLES PER ATTACK TYPE
# ============================
print("\n" + "="*65)
print("         MODEL ACCURACY TEST — 5 SAMPLES PER ATTACK TYPE")
print("="*65)

SAMPLES_PER_CLASS = 5
attack_types = df["Label"].unique()
results = defaultdict(lambda: {"correct": 0, "total": 0, "wrong": []})

for attack in sorted(attack_types):
    subset = df[df["Label"] == attack]
    samples = subset.sample(min(SAMPLES_PER_CLASS, len(subset)), random_state=42)

    for _, row in samples.iterrows():
        try:
            actual = row["Label"]
            sample_aligned = row[training_features].to_frame().T
            sample_aligned = sample_aligned.apply(pd.to_numeric, errors='coerce')
            pred_idx = model.predict(sample_aligned)
            detected = le.inverse_transform(pred_idx)[0]

            results[actual]["total"] += 1
            if actual == detected:
                results[actual]["correct"] += 1
            else:
                results[actual]["wrong"].append(detected)

        except Exception as e:
            print(f"❌ Error on attack '{attack}': {e}")
            break

# ============================
# PRINT RESULTS
# ============================
if not results:
    print("❌ No results collected — all predictions failed. Check errors above.")
else:
    print(f"\n{'Attack Type':<40} {'Correct':<10} {'Total':<10} {'Accuracy':<10} Status")
    print("-"*80)

    overall_correct = 0
    overall_total = 0

    for attack in sorted(results):
        c = results[attack]["correct"]
        t = results[attack]["total"]
        acc = (c / t) * 100
        overall_correct += c
        overall_total += t

        if acc == 100:
            status = "✅ GREAT"
        elif acc >= 60:
            status = "⚠️  OK"
        else:
            status = "❌ POOR"

        wrong_info = ""
        if results[attack]["wrong"]:
            wrong_info = f"  (misclassified as: {', '.join(set(results[attack]['wrong']))})"

        print(f"{attack:<40} {c:<10} {t:<10} {acc:<9.0f}% {status}{wrong_info}")

    print("-"*80)
    overall_acc = (overall_correct / overall_total) * 100

    if overall_acc >= 90:
        verdict = "🏆 EXCELLENT — Model is production ready!"
    elif overall_acc >= 75:
        verdict = "✅ GOOD — Model is working well"
    elif overall_acc >= 50:
        verdict = "⚠️  FAIR — Model needs improvement"
    else:
        verdict = "❌ POOR — Model needs retraining"

    print(f"{'OVERALL':<40} {overall_correct:<10} {overall_total:<10} {overall_acc:<9.1f}% {verdict}")
    print("="*80 + "\n")