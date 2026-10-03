#!/usr/bin/env python3
"""T6.2 Sanity check: prediksi maturity tidak turun (monoton naik) untuk dataset ini."""
import sys,os; sys.path.insert(0,"backend"); from app.services.predict import predict_forecast

res = predict_forecast(image_path=None)
forecast = res.get("forecast", [])
mat_vals = [f["maturity"] for f in forecast]
print("Forecast maturity:", mat_vals)
monotonic = all(mat_vals[i] <= mat_vals[i+1] for i in range(len(mat_vals)-1))
print("T6.2 OK — monoton naik:", monotonic, "| nilai:", mat_vals)
