import os, numpy as np
from app.main import load_models, MODELS

def predict_forecast(image_path=None):
    load_models()  # lazy load saat pertama dipanggil
    # 1. Ambil 14 hari terakhir (dari DB; untuk v1 pakai data fixed)
    # 2. Preprocess -> scale
    # 3. StageCNN -> logits (jika image_path diberikan, else default)
    # 4. Predict forecast model
    # 5. Inverse scale -> 4 hari x 3 nilai
    # Untuk v1: return struktur sesuai design.md §6
    # (Implementasi prediksi aktual akan diperkaya setelah stage_cnn + scaler validasi penuh)
    stage_logits = np.array([0.25, 0.25, 0.25, 0.25])  # dummy balanced
    # Gunakan forecast model jika sudah dimuat
    if MODELS.get("forecast_loaded"):
        model = MODELS["forecast"]
        # Input dummy (14,9) — akan diganti dengan data DB nyata
        x_in = np.zeros((1, 14, 9), dtype=np.float32)
        # Scale (dummy — akan pakai scaler_x saat full)
        pred_s = model.predict([x_in, np.array([stage_logits[:3]])], verbose=0)
        # Inverse scale (dummy — akan pakai scaler_y)
        # Untuk v1: kembalikan nilai dummy yang realistis berdasar trend DB (Day 380 maturity ~100%)
        forecast = []
        for offset in range(1, 5):
            forecast.append({
                "offset": offset,
                "day": 380 + offset,
                "moisture": 65.0,
                "temperature": 28.0,
                "maturity": min(100.0, 100 + offset*0.5),
                "stage": "harvest_ready",
            })
        return {"forecast": forecast, "history": [], "metrics": {}, "note": "v1 placeholder — pipeline forecast siap; stage logits dari StageCNN akan digunakan saat inference penuh."}
    else:
        return {"forecast": [], "history": [], "metrics": {}, "note": "forecast model belum dimuat (silakan periksa ml/artifacts/)."}
