from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.query import latest_reading, last_n_days

router = APIRouter()

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    latest = latest_reading(db)
    trend = last_n_days(db, 30)
    from app.services.predict import predict_forecast
    forecast_result = predict_forecast(image_path=None)
    return {
        "latest": {
            "day": latest.day if latest else 380,
            "dap": latest.dap if latest else 389,
            "time": latest.time if latest else "16:00",
            "soil_moisture": latest.soil_moisture if latest else 65.0,
            "temperature": latest.temperature if latest else 28.0,
            "soil_condition": latest.soil_condition if latest else "Optimal",
            "maturity_pct": latest.maturity_pct if latest else 100.0,
            "stage": latest.stage if latest else "harvest_ready",
        },
        "trend30": trend,
        "preview_forecast": forecast_result.get("forecast", [])[:4],
    }
