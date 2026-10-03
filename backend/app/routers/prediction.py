from fastapi import APIRouter, Body
from app.services.predict import predict_forecast

router = APIRouter()

@router.post("/predict/forecast")
def forecast(body: dict = Body(default={})):
    image = body.get("image")
    result = predict_forecast(image_path=image)
    return result
