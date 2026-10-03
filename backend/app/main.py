from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Pakcoy Monitor API", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load artifacts saat startup (lazy — hanya jika file ada)
MODELS = {}

def load_models():
    try:
        import tensorflow as tf
        if os.path.exists("ml/artifacts/stage_cnn.keras"):
            MODELS["stage_cnn"] = tf.keras.models.load_model("ml/artifacts/stage_cnn.keras")
            MODELS["stage_loaded"] = True
        if os.path.exists("ml/artifacts/forecast_model.keras"):
            MODELS["forecast"] = tf.keras.models.load_model("ml/artifacts/forecast_model.keras")
            MODELS["forecast_loaded"] = True
        # Load scalers
        import joblib
        if os.path.exists("ml/artifacts/scaler_x.pkl"):
            MODELS["scaler_x"] = joblib.load("ml/artifacts/scaler_x.pkl")
        if os.path.exists("ml/artifacts/scaler_y.pkl"):
            MODELS["scaler_y"] = joblib.load("ml/artifacts/scaler_y.pkl")
    except Exception as e:
        MODELS["load_error"] = str(e)
        MODELS["stage_loaded"] = False
        MODELS["forecast_loaded"] = False

load_models()

# Routers
from app.routers import dashboard, prediction, history, ai, health
app.include_router(health.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(prediction.router, prefix="/api/v1")
app.include_router(history.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
