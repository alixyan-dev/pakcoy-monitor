# Rencana Implementasi: Website Monitoring Pakcoy

> Dokumen ini adalah spec final. Dokumen lama `docs/system-description.txt` dianggap usang
> pada bagian **threshold stage** dan **pairing citra↔hari** — keduanya digantikan
> keputusan di dokumen ini.

## Keputusan Kunci (hasil review data riil)

1. **Opsi A dipilih**: CNN dilatih terpisah sebagai **klasifikasi 3-kelas** dari 3 folder
   gambar (tanpa pairing gambar↔hari). Logits-nya di-*concatenate* dengan output LSTM
   pada model forecast.
2. **Stage ditentukan dari counter hari (DAP)**, bukan threshold maturity — cocok 100%
   dengan ground truth Excel (maturity adalah fungsi hampir linier DAP:
   `maturity ≈ 0.179 × DAP + 29.78`, korelasi 0.9999).
3. **9 fitur/hari** didefinisikan eksplisit: mean/min/max × (kelembaban, suhu, maturity).
4. **Dataset fixed** (380 hari × 3 pengukuran = 1140 baris + 137 foto). Scope v1:
   import sekali via `load_data.py`. Menambah data = ganti Excel + jalankan ulang
   `load_data.py` (+ `train_forecast.py` bila ingin retrain).
5. Split training **kronologis** (bukan random) karena sliding window saling overlap.

## Inventaris Data

| Sumber | Detail |
|---|---|
| `data/new Dataset_Pakcoy.xlsx` | 1140 baris; kolom: Day, DAP, Time, Soil Moisture (%), Temperature (°C), Soil Condition, Ground Truth Maturity Level (%), Ground Truth Criteria. Tanpa null. Kelembaban 50–78%, suhu 24.5–30.8°C |
| `data/images/masa-pertumbuhan/` | 37 foto → Initial + Vegetative |
| `data/images/mendekati-panen/` | 36 foto → Pre-Harvest |
| `data/images/siap-panen/` | 64 foto → Harvest Ready |

Rentang stage di ground truth: Initial = Day 1–10, Vegetative = Day 11–20,
Pre-Harvest = Day 21–25, Harvest Ready = Day 26–380.

## 1. Arsitektur Sistem

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

- Frontend: Next.js (App Router, TypeScript, Tailwind, Recharts)
- Backend: Python 3.10+, FastAPI, SQLAlchemy 2.0, pandas + openpyxl
- ML: Keras 3 (TensorFlow 2.16+)
- DB: SQLite (dev, `data/pakcoy.db`) → Neon PostgreSQL (prod, via `DATABASE_URL`)

## 2. Struktur Folder Proyek

```
pakcoy-monitor/
├── data/
│   ├── new Dataset_Pakcoy.xlsx
│   └── images/
│       ├── masa-pertumbuhan/   (37 foto)
│       ├── mendekati-panen/    (36 foto)
│       └── siap-panen/         (64 foto)
├── ml/                          # skrip training offline
│   ├── dataset.py               # load gambar folder, augmentasi, sliding window, agregasi harian
│   ├── train_stage_cnn.py       # CNN 3-kelas
│   ├── train_forecast.py        # LSTM + fusion head
│   └── artifacts/               # stage_cnn.keras, forecast_model.keras, scaler.json, report.json
├── backend/
│   ├── app/
│   │   ├── main.py              # app FastAPI, CORS, load model saat startup
│   │   ├── config.py            # env vars (pydantic-settings)
│   │   ├── db/                  # engine, ORM models, query helpers
│   │   ├── schemas.py
│   │   ├── ml/
│   │   │   ├── forecast.py      # build & load model, preprocessing, inverse scaling
│   │   │   ├── stage.py         # mapping stage dari DAP
│   │   │   └── artifacts/       # (copy dari ml/artifacts untuk deploy)
│   │   ├── services/
│   │   │   ├── dashboard.py, history.py, export_csv.py
│   │   │   ├── predict.py       # pipeline forecast end-to-end
│   │   │   └── ai_chat.py       # konteks + OpenRouter + fallback
│   │   └── routers/             # dashboard, prediction, history, ai, health
│   ├── load_data.py             # Excel → DB (idempoten)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                    # Next.js
│   └── app/ (dashboard /, prediction, history, assistant, about)
└── README.md
```

## 3. Skema Database

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

Kunci unik: `(day, time)`. `load_data.py` drop + re-insert agar idempoten.

## 4. Model ML (Opsi A)

### 4.1 Stage CNN — klasifikasi 3 kelas (dibuat dulu, di-freeze)

| Aspek | Nilai |
|---|---|
| Data | 137 foto dari 3 folder, label = nama folder |
| Preprocessing | resize 224×224, normalisasi 0–1 |
| Arsitektur | MobileNetV2 (pretrained ImageNet) → GlobalAveragePooling → Dense(64, ReLU) → Dropout(0.3) → Dense(3, softmax) |
| Split | stratified 70/15/15 per kelas |
| Augmentasi | flip horizontal, rotasi ±15°, brightness ±0.2, contrast ±0.15 |
| Imbalance (37/36/64) | `class_weight` invers frekuensi |
| Optimizer | Adam lr=1e-4 (fine-tune), loss sparse categorical cross-entropy, EarlyStopping patience=10 |
| Output | `stage_cnn.keras` + report (akurasi, F1 per kelas, confusion matrix) |

Keuntungan: CNN dilatih murni dari label folder — tidak butuh pairing gambar↔hari.

### 4.2 Forecast Model — LSTM + fusion head

**Preprocessing (konsisten antara train & inference):**

1. Ambil baris Excel → **agregasi harian**: untuk tiap hari hitung mean/min/max dari
   3 pengukuran → **9 fitur/hari** =
   `[moisture_mean, moisture_min, moisture_max, temp_mean, temp_min, temp_max,
    maturity_mean, maturity_min, maturity_max]`.
2. **Sliding window**: input 14 hari → output 4 hari → total **363 sample**.
3. Scaling: `StandardScaler` (9 fitur) + scaler terpisah untuk target; fit hanya di
   training windows. Disimpan `scaler.json`.
4. Split **kronologis** 70/15/15 (bukan random) → 254/54/54 sample.

**Arsitektur:**

```
Branch temporal:  Input (14, 9)
                  → LSTM(64, return_sequences=True)
                  → LSTM(32)
                  → Dense(32, ReLU) → Dropout(0.3)   ──► vektor 32

Branch visual:    Input (3,)  ← logits StageCNN dari foto stage hari terakhir window
                                                        ──► vektor 3

Fusion:           Concatenate (32 + 3 = 35)
                  → Dense(64, ReLU) → Dropout(0.3)
                  → Dense(12, linear) → reshape (4, 3)
                  Output: per hari = [kelembaban, suhu, maturity]
```

**Pairing gambar saat training (aturan final):** untuk window yang berakhir di hari *T*,
gambar diambil acak (seed per epoch) dari folder stage-nya hari *T* — konsisten dengan
semantic inference ("foto terbaru + 14 hari terakhir").

**Training:** MSE, Adam lr=1e-3, max 100 epoch, EarlyStopping patience=10
(monitor val_loss). Evaluasi MAE/RMSE/R² per target (kelembaban, suhu, maturity)
→ `report.json`.

**Inference pipeline** (dipakai endpoint forecast):

1. 14 hari terakhir dari DB → agregasi → 14×9 → scale.
2. Foto "terkini" = foto representatif dari folder stage hari terakhir DB
   (config `IMAGE_MAP` di env; default = file pertama yang valid per folder)
   → StageCNN → logits(3).
3. Concat → forecast model → inverse scale → 4 × (kelembaban, suhu, maturity).
4. Stage tiap hari prediksi = dari counter hari (DAP), bukan threshold maturity.

### 4.3 Aturan Stage (final, menggantikan threshold dokumen lama)

| DAP | Stage |
|---|---|
| 10–19 | Initial |
| 20–29 | Vegetative |
| 30–34 | Pre-Harvest |
| ≥35 | Harvest Ready |

Maturity prediksi tetap dipakai untuk progress bar & tabel angka; badge stage dari DAP.

## 5. API Backend (`/api/v1`)

| Endpoint | Fungsi |
|---|---|
| `GET /health` | model loaded?, DB reachable?, metrik model (MAE/RMSE/R²) |
| `GET /dashboard` | reading terakhir (day, time, moisture, temp, soil_condition, maturity, stage), tren 30 hari (rata-rata harian), preview forecast |
| `POST /predict/forecast` | body opsional `{ "image": "siap-panen/xxx.jpg" }` → forecast 4 hari + histori 14 hari + metrik. Citra tak ada → pakai stage terakhir (one-hot) |
| `GET /history?page=1&limit=20&day_from=&day_to=&stage=&soil_condition=` | paginasi + filter, return `{ rows, total, page, pages }` |
| `GET /export.csv` | seluruh data (opsional filter sama) sebagai `StreamingResponse` CSV |
| `POST /ai/chat` | body `{ message, history[] }` → prompt konteks (sensor terkini, stage, maturity, forecast 4 hari, metrik) → OpenRouter → jawaban. Gagal/rate-limit → fallback rule-based |

Default model LLM: `meta-llama/llama-3.1-8b-instruct:free`, via env
`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_BASE_URL`.

## 6. Frontend (5 halaman)

1. **Dashboard `/`** — 3 kartu sensor (hijau=Optimal, biru=Wet, merah=Dry),
   progress bar maturity, badge stage, grafik garis 30 hari (Recharts),
   kartu preview forecast → link ke `/prediction`.
2. **Prediction** — grafik solid (14 hari histori) + putus-putus (4 hari forecast),
   tabel detail per hari, disclaimer keterbatasan + metrik model.
3. **History** — tabel paginasi, filter (rentang hari, stage, kondisi tanah),
   tombol Export CSV.
4. **AI Assistant** — chat UI + Quick Actions: Analisis Kondisi, Saran Penyiraman,
   Prediksi Panen, Peringatan Dini.
5. **About** — statis + metrik model dari `/health`.

State fetching: SWR atau fetch + loading/error state per kartu.

## 7. Fase Pengembangan & Estimasi

| Fase | Isi | Estimasi |
|---|---|---|
| 0. Setup | Scaffold folder, requirements, .env.example, README, git init | 0.5 hari |
| 1. Data & DB | `load_data.py`, skema, sanity check 1140 baris, query dasar | 0.5 hari |
| 2. Stage CNN | `dataset.py` + `train_stage_cnn.py`, evaluasi, artifact | 0.5–1 hari |
| 3. Forecast model | `train_forecast.py`, window, scaler, fusion, evaluasi, artifact | 1 hari |
| 4. Backend API | FastAPI + semua endpoint + AI chat + CORS + error handling | 1 hari |
| 5. Frontend | 5 halaman + komponen + chart | 2 hari |
| 6. Testing | Unit test endpoint, cek forecast monoton (maturity tak turun), E2E lokal | 0.5–1 hari |
| 7. Deployment | Vercel + Railway/Render + Neon PG + env vars + verifikasi produksi | 0.5–1 hari |

Total: **~7–8 hari kerja**. Fase 2 & 3 bisa paralel setelah Fase 1.

## 8. Keputusan Konfigurasi Kunci

- **Foto representatif per stage**: tentukan 1 file per folder sebagai `rep`
  (atau config `IMAGE_MAP` di env) — dataset fixed, cukup 3 foto ini.
- **Artifact model** di-copy ke `backend/app/ml/artifacts/` dan di-include di
  Dockerfile → backend langsung bisa inference tanpa training ulang.
- Semua angka "9 fitur", aturan stage, dan pipeline di atas adalah **spec final**.
- **Scope v1**: dataset fixed. Menambah data = ganti Excel + jalankan `load_data.py`
  (+ retrain bila perlu). Endpoint import **tidak** dibuat di v1.

## 9. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Overfitting forecast (254 sample train) | Model kecil, early stopping, dropout; pantau val loss; fallback: perbesar window ke 21 hari |
| Imbalance kelas gambar | `class_weight` invers frekuensi |
| Free tier LLM rate-limit | Error handling + fallback rekomendasi rule-based |
| Kebocoran data (window overlap) | Split kronologis, bukan random |
| API key bocor | Hanya di env backend, tidak pernah ke frontend |
| Foto korup di folder | Script memvalidasi & skip file tak terbaca |
