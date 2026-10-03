#!/usr/bin/env python3
"""Dataset forecasting: agregasi harian (9 fitur) + sliding window 14→4."""
import sys, os, numpy as np, pandas as pd
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load Excel langsung (tidak bergantung DB, tapi konsisten dengan DB)
from openpyxl import load_workbook

FILE = "data/new Dataset_Pakcoy.xlsx"

def load_aggregated():
    df = pd.read_excel(FILE)
    # Agregasi harian: mean/min/max per day untuk 3 pengukuran (08/12/16)
    agg = df.groupby("Day").agg(
        moisture_mean=("Soil Moisture (%)", "mean"),
        moisture_min=("Soil Moisture (%)", "min"),
        moisture_max=("Soil Moisture (%)", "max"),
        temperature_mean=("Temperature (°C)", "mean"),
        temperature_min=("Temperature (°C)", "min"),
        temperature_max=("Temperature (°C)", "max"),
        maturity_mean=("Ground Truth Maturity Level (%)", "mean"),
        maturity_min=("Ground Truth Maturity Level (%)", "min"),
        maturity_max=("Ground Truth Maturity Level (%)", "max"),
    ).reset_index()
    # Urutan fitur sesuai design.md §5.2
    features = [
        "moisture_mean", "moisture_min", "moisture_max",
        "temperature_mean", "temperature_min", "temperature_max",
        "maturity_mean", "maturity_min", "maturity_max",
    ]
    agg = agg.sort_values("Day").reset_index(drop=True)
    return agg[["Day"] + features]

def build_windows(agg_df, input_window=14, output_window=4):
    data = agg_df.drop(columns=["Day"]).values  # (380, 9)
    X, y = [], []
    for i in range(len(data) - input_window - output_window + 1):
        X.append(data[i:i+input_window])          # (14, 9)
        y.append(data[i+input_window:i+input_window+output_window, :3])  # hanya 3 target: moisture, temp, maturity (mean)
    X = np.array(X)  # (363, 14, 9)
    y = np.array(y)  # (363, 4, 3)
    return X, y

if __name__ == "__main__":
    agg = load_aggregated()
    X, y = build_windows(agg)
    print("T3.1 OK —", X.shape, "X |", y.shape, "y | samples=", len(X),
          "| features=", X.shape[2], "| window_in=14 | window_out=4")
