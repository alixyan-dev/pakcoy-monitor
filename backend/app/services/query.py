"""Helpers query DB sensor_reading — digunakan oleh service dashboard / history."""
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.db.database import SensorReading

def latest_reading(db: Session):
    return db.query(SensorReading).order_by(desc(SensorReading.id)).first()

def last_n_days(db: Session, n: int = 30):
    # Rata-rata harian (1 baris per day — 08/12/16 digabung atau ambil 16:00 saja)
    # Untuk tren sederhana: ambil 08:00 terakhir tiap hari, rata-rata
    # Ini versi sederhana: ambil semua, group by day
    from sqlalchemy import distinct
    # Ambil semua kemudian group manual untuk kecepatan v1
    rows = db.query(SensorReading).order_by(desc(SensorReading.day)).limit(n*3).all()
    # Kelompokkan per day, ambil rata-rata (mean) dari 3 pengukuran
    from collections import defaultdict
    grouped = defaultdict(lambda: {"moisture": [], "temp": []})
    for r in rows:
        grouped[r.day]["moisture"].append(r.soil_moisture)
        grouped[r.day]["temp"].append(r.temperature)
    result = []
    for day in sorted(grouped, reverse=True)[:n]:
        vals = grouped[day]
        result.append({
            "day": day,
            "moisture_avg": round(sum(vals["moisture"]) / len(vals["moisture"]), 1),
            "temperature_avg": round(sum(vals["temp"]) / len(vals["temp"]), 1),
        })
    return list(reversed(result))  # oldest first

def paginated_history(db: Session, page: int = 1, limit: int = 20,
                      day_from=None, day_to=None, stage=None, soil_condition=None):
    q = db.query(SensorReading)
    if day_from is not None:
        q = q.filter(SensorReading.day >= day_from)
    if day_to is not None:
        q = q.filter(SensorReading.day <= day_to)
    if stage:
        q = q.filter(SensorReading.stage == stage)
    if soil_condition:
        q = q.filter(SensorReading.soil_condition == soil_condition)
    total = q.count()
    rows = q.order_by(desc(SensorReading.day)).offset((page-1)*limit).limit(limit).all()
    return {"rows": rows, "total": total, "page": page, "pages": (total + limit - 1)//limit}

def export_csv_data(db: Session, **filters):
    # Filter sama dengan paginated_history, tapi semua baris
    q = db.query(SensorReading)
    if filters.get("day_from") is not None:
        q = q.filter(SensorReading.day >= filters["day_from"])
    if filters.get("day_to") is not None:
        q = q.filter(SensorReading.day <= filters["day_to"])
    if filters.get("stage"):
        q = q.filter(SensorReading.stage == filters["stage"])
    if filters.get("soil_condition"):
        q = q.filter(SensorReading.soil_condition == filters["soil_condition"])
    return q.order_by(desc(SensorReading.day)).all()
