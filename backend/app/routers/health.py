from fastapi import APIRouter
from app.main import MODELS
import os, json

router = APIRouter()

@router.get("/health")
def health():
    metrics = {}
    try:
        if os.path.exists("ml/artifacts/report_forecast.json"):
            with open("ml/artifacts/report_forecast.json") as f:
                r = json.load(f)
                metrics["forecast"] = {"mae": r.get("mae"), "rmse": r.get("rmse"), "r2": r.get("r2")}
        if os.path.exists("ml/artifacts/report_stage.json"):
            with open("ml/artifacts/report_stage.json") as f:
                r = json.load(f)
                metrics["stage_cnn"] = {"test_accuracy": r.get("test_accuracy"), "test_f1": r.get("test_f1_weighted")}
    except Exception as e:
        metrics["error"] = str(e)
    return {
        "status": "ok" if MODELS.get("forecast_loaded") else "degraded",
        "models_loaded": {
            "stage_cnn": MODELS.get("stage_loaded", False),
            "forecast": MODELS.get("forecast_loaded", False),
        },
        "db_ok": True,
        "metrics": metrics,
    }
