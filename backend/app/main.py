from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Pakcoy Monitor API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS = {}
_model_loaded = False

def load_models():
    global _model_loaded
    if _model_loaded:
        return
    try:
        import tensorflow as tf
        if os.path.exists("ml/artifacts/stage_cnn.keras"):
            MODELS["stage_cnn"] = tf.keras.models.load_model("ml/artifacts/stage_cnn.keras")
            MODELS["stage_loaded"] = True
        if os.path.exists("ml/artifacts/forecast_model.keras"):
            MODELS["forecast"] = tf.keras.models.load_model("ml/artifacts/forecast_model.keras")
            MODELS["forecast_loaded"] = True
        import joblib
        if os.path.exists("ml/artifacts/scaler_x.pkl"):
            MODELS["scaler_x"] = joblib.load("ml/artifacts/scaler_x.pkl")
        if os.path.exists("ml/artifacts/scaler_y.pkl"):
            MODELS["scaler_y"] = joblib.load("ml/artifacts/scaler_y.pkl")
        _model_loaded = True
    except Exception as e:
        MODELS["load_error"] = str(e)
        MODELS["stage_loaded"] = False
        MODELS["forecast_loaded"] = False

# Tidak lagi memuat saat import — lazy load saat endpoint dipanggil
from app.routers import dashboard, prediction, history, ai, health
app.include_router(health.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(prediction.router, prefix="/api/v1")
app.include_router(history.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
