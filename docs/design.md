# Design — Website Monitoring Pakcoy
(Diambil dari `PLAN.md` — bagian "BAGAIMANA". Sumber utama detail: `PLAN.md`.)

## 1. Arsitektur

```
┌─────────────┐        ┌──────────────────────────────────────────┐
│  Next.js    │  HTTP  │              FastAPI (backend)           │
│  (Vercel)   │ ─────► │  /dashboard /predict /history /ai /export│
└─────────────┘        │  ┌──────────┐  ┌───────────────────────┐ │
                       │  │  SQLite / │  │  Forecast Engine      │ │
                       │  │ Neon PG   │  │  StageCNN → logits(3) │ │
                       │  │ (data)    │  │  + LSTM(32) → concat  │ │
                       │  └──────────┘  │  → Dense → 12 values  │ │
                       │                └───────────────────────┘ │
                       │                OpenRouter (LLM, opsional)│
                       └──────────────────────────────────────────┘
```

## 2. Tech Stack
- Frontend: Next.js (App Router, TypeScript, Tailwind, Recharts, SWR)
- Backend: Python 3.10+, FastAPI, SQLAlchemy 2.0, pydantic-settings, pandas, openpyxl
- ML: Keras 3 / TensorFlow 2.16+
- DB: SQLite (`data/pakcoy.db`, dev) → Neon PostgreSQL (prod, via `DATABASE_URL`)

## 3. Struktur Folder
```
pakcoy-monitor/
├── .opencode/instruction.md   # aturan kerja AI & developer
├── docs/                      # requirements.md, design.md, tasks.md, system-description.txt
├── PLAN.md                    # rencana implementasi asal (sumber spec)
├── data/
│   ├── new Dataset_Pakcoy.xlsx
│   └── images/{masa-pertumbuhan, mendekati-panen, siap-panen}
├── ml/
│   ├── dataset.py
│   ├── train_stage_cnn.py
│   ├── train_forecast.py
│   └── artifacts/             # stage_cnn.keras, forecast_model.keras, scaler.json, report.json
├── backend/
│   ├── app/
│   │   ├── main.py            # app FastAPI, CORS, load model saat startup
│   │   ├── config.py          # env vars (pydantic-settings)
│   │   ├── db/                # engine, ORM models, query helpers
│   │   ├── schemas.py
│   │   ├── ml/
│   │   │   ├── forecast.py    # build & load model, preprocessing, inverse scaling
│   │   │   ├── stage.py       # mapping stage dari DAP
│   │   │   └── artifacts/     # (copy dari ml/artifacts untuk deploy)
│   │   ├── services/          # dashboard, history, export_csv, predict, ai_chat
│   │   └── routers/           # dashboard, prediction, history, ai, health
│   ├── load_data.py           # Excel → DB (idempoten)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
└── frontend/
    ├── app/{prediction,history,assistant,about} + page.tsx (dashboard)
    ├── components/
    └── lib/                   # api.ts
```

## 4. Skema Database
Tabel tunggal `sensor_reading` (1140 baris, sesuai Excel):

| Kolom | Tipe | Catatan |
|---|---|---|
| id | PK | autoincrement |
| day | int | 1–380 |
| dap | int | day + 9 |
| time | text | `08:00` / `12:00` / `16:00` |
| soil_moisture | float | % |
| temperature | float | °C |
| soil_condition | text | Wet / Optimal / Dry |
| maturity_pct | float | % |
| stage | text | `initial` / `vegetative` / `pre_harvest` / `harvest_ready` |

Kunci unik: `(day, time)`. `backend/load_data.py`: drop + re-insert (idempoten),
validasi 1140 baris, normalisasi nilai stage ke enum.

## 5. Pipeline ML

### 5.1 Stage CNN (3 kelas)
- Data: 137 foto dari 3 folder, label = nama folder. Resize 224×224, normalisasi 0–1.
- Arsitektur: MobileNetV2 (pretrained ImageNet) → GlobalAveragePooling →
  Dense(64, ReLU) → Dropout(0.3) → Dense(3, softmax).
- Split stratified 70/15/15 per kelas; augmentasi: flip horizontal, rotasi ±15°,
  brightness ±0.2, contrast ±0.15; `class_weight` invers frekuensi.
- Adam lr=1e-4 (fine-tune), loss sparse categorical cross-entropy,
  EarlyStopping patience=10.
- Output: `ml/artifacts/stage_cnn.keras` + report (akurasi, F1 per kelas,
  confusion matrix).

### 5.2 Forecast Model
**Preprocessing (konsisten train & inference):**
- Agregasi harian dari 3 pengukuran → **9 fitur/hari (urutan fixed)**:
  `[moisture_mean, moisture_min, moisture_max,
    temp_mean, temp_min, temp_max,
    maturity_mean, maturity_min, maturity_max]`
- Sliding window: input 14 hari → output 4 hari → **363 sample**.
- Split KRONOLOGIS 70/15/15 (bukan random — window saling overlap).
- Scaling: `StandardScaler` per 9 fitur + scaler terpisah untuk target; fit hanya
  di training windows; simpan `ml/artifacts/scaler.json`.

**Arsitektur:**
```
Branch temporal:  Input (14, 9)
                  → LSTM(64, return_sequences=True)
                  → LSTM(32)
                  → Dense(32, ReLU) → Dropout(0.3)   ──► vektor 32

Branch visual:    Input (3,)  ← logits StageCNN
                                                        ──► vektor 3

Fusion:           Concatenate (32 + 3 = 35)
                  → Dense(64, ReLU) → Dropout(0.3)
                  → Dense(12, linear) → reshape (4, 3)
                  Output per hari: [kelembaban, suhu, maturity]
```

**Aturan pairing gambar saat training:** window yang berakhir di hari *T* →
gambar diambil acak (seed per epoch) dari **folder stage-nya hari T**
(selalu folder stage hari TERAKHIR window).

**Training:** MSE, Adam lr=1e-3, max 100 epoch, EarlyStopping patience=10
(monitor val_loss).

**Evaluasi:** MAE / RMSE / R² per target (kelembaban, suhu, maturity)
→ `ml/artifacts/report.json`.

**Inference pipeline** (dipakai endpoint forecast):
1. 14 hari terakhir dari DB → agregasi → 14×9 → scale.
2. Foto "terkini" = foto representatif dari folder stage hari terakhir DB
   (config `IMAGE_MAP` di env; default = file pertama yang valid per folder)
   → StageCNN → logits(3).
3. Concat → forecast model → inverse scale → 4 × (kelembaban, suhu, maturity).
4. Stage tiap hari prediksi = dari aturan DAP (§5.3), bukan threshold maturity.
5. Citra gagal/di-skip → pakai one-hot stage terakhir (tetap berhasil).

### 5.3 Aturan Stage (final — TIDAK BOLEH diubah tanpa update requirements)
| DAP | Stage |
|---|---|
| 10–19 | `initial` |
| 20–29 | `vegetative` |
| 30–34 | `pre_harvest` |
| ≥35 | `harvest_ready` |

Maturity prediksi tetap dipakai untuk progress bar & tabel angka;
badge stage dari DAP.

## 6. Kontrak API (prefix `/api/v1`)

### GET /health
```json
{ "status": "ok",
  "models_loaded": { "stage_cnn": true, "forecast": true },
  "db_ok": true,
  "metrics": { "mae": { "moisture": 0, "temperature": 0, "maturity": 0 },
               "rmse": { "...": 0 }, "r2": { "...": 0 } } }
```

### GET /dashboard
```json
{ "latest": { "day": 0, "dap": 0, "time": "16:00",
              "soil_moisture": 0.0, "temperature": 0.0,
              "soil_condition": "Optimal", "maturity_pct": 0.0,
              "stage": "harvest_ready" },
  "trend30": [ { "day": 0, "moisture_avg": 0.0, "temperature_avg": 0.0 } ],
  "preview_forecast": [ { "offset": 1, "moisture": 0.0, "temperature": 0.0,
                          "maturity": 0.0, "stage": "harvest_ready" } ] }
```

### POST /predict/forecast
Body (opsional): `{ "image": "siap-panen/nama.jpg" }` — null/absen = default.
```json
{ "forecast": [ { "offset": 1, "day": 0, "moisture": 0.0, "temperature": 0.0,
                  "maturity": 0.0, "stage": "harvest_ready" } ],
  "history":  [ { "day": 0, "moisture": 0.0, "temperature": 0.0,
                  "maturity": 0.0 } ],
  "metrics": { "mae": { }, "rmse": { }, "r2": { } } }
```

### GET /history
Query: `page=1&limit=20&day_from=&day_to=&stage=&soil_condition=`
(limit max 100)
```json
{ "rows": [ { "id": 0, "day": 0, "dap": 0, "time": "08:00",
              "soil_moisture": 0.0, "temperature": 0.0,
              "soil_condition": "Optimal", "maturity_pct": 0.0,
              "stage": "initial" } ],
  "total": 0, "page": 1, "pages": 0 }
```

### GET /export.csv
Query filter opsional (sama dengan /history) → `200 text/csv`
(StreamingResponse, header `Content-Disposition: attachment`).

### POST /ai/chat
Body: `{ "message": "...", "history": [{ "role": "user|assistant", "content": "..." }] }`
```json
{ "reply": "..." }
```
LLM gagal / rate-limit → backend menjalankan fallback rule-based; jika fallback
pun gagal → 502 + pesan ramah.

## 7. Frontend
- Halaman: `/` (Dashboard), `/prediction`, `/history`, `/assistant`, `/about`
- Komponen inti: `SensorCard`, `MaturityBar`, `StageBadge`, `TrendChart`,
  `ForecastChart`, `ForecastTable`, `HistoryTable`, `FilterBar`, `ChatBox`,
  `QuickActions`
- Semua data via `frontend/lib/api.ts` (typed client); SWR untuk fetching;
  state loading/error per kartu.

## 8. Konfigurasi (env)
| Variable | Default (dev) | Catatan |
|---|---|---|
| `DATABASE_URL` | `sqlite:///data/pakcoy.db` | prod: Neon PostgreSQL |
| `OPENROUTER_API_KEY` | (wajib di prod) | backend only |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | |
| `OPENROUTER_MODEL` | `meta-llama/llama-3.1-8b-instruct:free` | |
| `IMAGE_MAP` | (opsional) `stage→path` per folder | foto representatif |

Frontend: `NEXT_PUBLIC_API_BASE` (default `http://localhost:8000/api/v1`).

## 9. Deployment
- Frontend → Vercel; Backend → Railway/Render (Docker; `ml/artifacts` di-copy ke
  `backend/app/ml/artifacts/` agar ter-include di image).
- DB → Neon PostgreSQL (prod); env vars dikonfigurasi per platform.
- Frontend terhubung ke URL API production via `NEXT_PUBLIC_API_BASE`.
