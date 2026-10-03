"""Unit tests untuk endpoint /api/v1 (T6.1)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ["DATABASE_URL"] = "sqlite:///data/pakcoy.db"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    assert r.json()["models_loaded"]["forecast"] is True

def test_dashboard():
    r = client.get("/api/v1/dashboard")
    assert r.status_code == 200
    assert "latest" in r.json()
    assert "trend30" in r.json()

def test_predict():
    r = client.post("/api/v1/predict/forecast", json={})
    assert r.status_code == 200
    assert "forecast" in r.json()

def test_history_pagination():
    r = client.get("/api/v1/history?page=1&limit=5")
    assert r.status_code == 200
    assert "rows" in r.json() and len(r.json()["rows"]) <= 5

def test_export_csv():
    r = client.get("/api/v1/export.csv")
    assert r.status_code == 200
    assert "text/csv" in r.headers["content-type"]

def test_ai_chat():
    r = client.post("/api/v1/ai/chat", json={"message": "kondisi tanaman?"})
    assert r.status_code == 200
    assert "reply" in r.json()

if __name__ == "__main__":
    test_health()
    test_dashboard()
    test_predict()
    test_history_pagination()
    test_export_csv()
    test_ai_chat()
    print("T6.1 OK — semua endpoint /api/v1 lolos (health, dashboard, predict, history, export, ai/chat)")
