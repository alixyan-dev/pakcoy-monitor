from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.query import paginated_history, export_csv_data
from fastapi.responses import StreamingResponse
import csv, io

router = APIRouter()

@router.get("/history")
def history(page: int = 1, limit: int = 20,
            day_from: int = None, day_to: int = None,
            stage: str = None, soil_condition: str = None,
            db: Session = Depends(get_db)):
    res = paginated_history(db, page=page, limit=min(limit, 100),
                           day_from=day_from, day_to=day_to,
                           stage=stage, soil_condition=soil_condition)
    # Konversi ORM -> dict untuk JSON
    rows_dict = [{
        "id": r.id, "day": r.day, "dap": r.dap, "time": r.time,
        "soil_moisture": r.soil_moisture, "temperature": r.temperature,
        "soil_condition": r.soil_condition, "maturity_pct": r.maturity_pct,
        "stage": r.stage,
    } for r in res["rows"]]
    return {"rows": rows_dict, "total": res["total"], "page": res["page"], "pages": res["pages"]}

@router.get("/export.csv")
def export_csv(day_from: int = None, day_to: int = None,
               stage: str = None, soil_condition: str = None,
               db: Session = Depends(get_db)):
    rows = export_csv_data(db, day_from=day_from, day_to=day_to,
                          stage=stage, soil_condition=soil_condition)
    out = io.StringIO()
    writer = csv.writer(out)
    writer.writerow(["id","day","dap","time","soil_moisture","temperature",
                     "soil_condition","maturity_pct","stage"])
    for r in rows:
        writer.writerow([r.id, r.day, r.dap, r.time,
                         r.soil_moisture, r.temperature,
                         r.soil_condition, r.maturity_pct, r.stage])
    return StreamingResponse(io.BytesIO(out.getvalue().encode()),
                             media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=pakcoy_data.csv"})
