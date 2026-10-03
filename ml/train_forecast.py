#!/usr/bin/env python3
"""Forecast model: LSTM temporal + fusion with stage logits (3) -> Dense -> 12 outputs."""
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tensorflow import keras
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import json

from ml.forecast_dataset import load_aggregated, build_windows

# Load & split KRONOLOGIS 70/15/15 (bukan random!)
agg = load_aggregated()
X, y = build_windows(agg)
# y = (363, 4, 3) -> flatten per sample menjadi (363, 12)
y_flat = y.reshape(y.shape[0], -1)  # 363 x 12

# Split kronologis: pertama 70% train, lalu 15% val, 15% test
n = len(X)
n_train = int(0.70 * n)  # 254
n_val = int(0.15 * n)    # 54
n_test = n - n_train - n_val  # 55

X_train, y_train = X[:n_train], y_flat[:n_train]
X_val, y_val = X[n_train:n_train+n_val], y_flat[n_train:n_train+n_val]
X_test, y_test = X[n_train+n_val:], y_flat[n_train+n_val:]

print("Split kronologis — train:", len(X_train), "val:", len(X_val), "test:", len(X_test))

# Scaling: hanya fit pada train
# X: (254, 14, 9) -> reshape ke 2D untuk scaler
scaler = StandardScaler()
X_shape = X_train.shape
X_train_2d = X_train.reshape(-1, 9)
scaler.fit(X_train_2d)
X_train_s = scaler.transform(X_train_2d).reshape(X_shape)
X_val_s = scaler.transform(X_val.reshape(-1, 9)).reshape(X_val.shape)
X_test_s = scaler.transform(X_test.reshape(-1, 9)).reshape(X_test.shape)

# Target scaler (untuk inverse setelah prediksi)
y_scaler = StandardScaler()
y_scaler.fit(y_train)
y_train_s = y_scaler.transform(y_train)
y_val_s = y_scaler.transform(y_val)
y_test_s = y_scaler.transform(y_test)

# Model architecture (sesuai design.md §5.2 — Opsi A fusion)
# Cabang temporal: LSTM
inputs = keras.Input(shape=(14, 9), name="sensor_input")
lstm1 = keras.layers.LSTM(64, return_sequences=True)(inputs)
lstm2 = keras.layers.LSTM(32)(lstm1)
dense_t = keras.layers.Dense(32, activation="relu")(lstm2)
dense_t = keras.layers.Dropout(0.3)(dense_t)

# Cabang visual: logits stage (3) dari Stage CNN — di-v1 kita simulasikan dengan input tetap [1, 1, 1]
# (Pada inference: StageCNN -> logits; di sini: input dummy untuk arsitektur lengkap)
# Untuk training v1, kita gunakan input tetap (one-hot stage terakhir sebagai dummy visual)
# Namun karena kita belum punya stage logits per window, kita buat input fixed (1,1,1) sebagai placeholder.
# Ini sesuai prinsip: cabang visual bisa di-train dengan pairing, tapi untuk v1 kita fokus temporal.
# Agar tetap multimodal: kita tambahkan input (3,) yang akan diisi saat inference.
visual_input = keras.Input(shape=(3,), name="stage_logits")
# Gabungkan
merged = keras.layers.Concatenate()([dense_t, visual_input])
merged = keras.layers.Dense(64, activation="relu")(merged)
merged = keras.layers.Dropout(0.3)(merged)
outputs = keras.layers.Dense(12, activation="linear", name="forecast_12")(merged)

model = keras.Model(inputs=[inputs, visual_input], outputs=outputs)
model.compile(optimizer=keras.optimizers.Adam(learning_rate=1e-3), loss="mse", metrics=["mae"])

# Dummy visual input (one-hot: semua 1/3 ~ equal untuk training dasar, bisa diganti nanti)
dummy_visual = np.ones((len(X_train_s), 3)) / 3.0

# EarlyStopping
es = keras.callbacks.EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True)

print("Train model (LSTM + fusion) — ini bisa memakan waktu (CPU)...")
model.fit(
    [X_train_s, dummy_visual], y_train_s,
    validation_data=([X_val_s, np.ones((len(X_val_s),3))/3], y_val_s),
    epochs=100, batch_size=16, callbacks=[es], verbose=2
)

# Evaluasi
pred_test_s = model.predict([X_test_s, np.ones((len(X_test_s),3))/3], verbose=0)
pred_test = y_scaler.inverse_transform(pred_test_s)
y_test_inv = y_scaler.inverse_transform(y_test_s)

mae = np.mean(np.abs(pred_test - y_test_inv))
rmse = np.sqrt(np.mean((pred_test - y_test_inv)**2))
r2 = 1 - np.sum((y_test_inv - pred_test)**2) / np.sum((y_test_inv - np.mean(y_test_inv))**2)

# Simpan artifact + scaler + report
os.makedirs("ml/artifacts", exist_ok=True)
model.save("ml/artifacts/forecast_model.keras")
import joblib
joblib.dump(scaler, "ml/artifacts/scaler_x.pkl")
joblib.dump(y_scaler, "ml/artifacts/scaler_y.pkl")

report = {
    "model": "Multimodal_LSTM_forecast",
    "input_shape": [14, 9],
    "output_shape": [4, 3],
    "split": "chronological_70_15_15",
    "train": len(X_train_s), "val": len(X_val_s), "test": len(X_test_s),
    "mae": round(float(mae), 4),
    "rmse": round(float(rmse), 4),
    "r2": round(float(r2), 4),
    "note": "Visual branch (stage logits) digunakan dummy saat training; akan diganti dengan StageCNN logits saat inference.",
}
with open("ml/artifacts/report_forecast.json", "w") as f:
    json.dump(report, f, indent=2)
print("T3.2 OK — artifact forecast_model.keras | MAE=", round(mae,4), "RMSE=", round(rmse,4), "R2=", round(r2,4))
