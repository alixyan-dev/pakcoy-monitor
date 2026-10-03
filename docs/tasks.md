# Tasks — Website Monitoring Pakcoy
Aturan: centang `[x]` HANYA jika semua completion criteria terpenuhi
(liat `.opencode/instruction.md` §5). Update file ini di commit yang sama
dengan task-nya.

## Fase 0 — Setup
- [x] T0.1 `git init` + `.gitignore` (`.env`, `*.db`, `__pycache__/`,
  `node_modules/`, `.next/`, `*.log`)
  ✔ criteria: `git status` bersih, tidak ada file rahasia yang ter-track
- [x] T0.2 `backend/requirements.txt` (fastapi, uvicorn, sqlalchemy, pandas,
  openpyxl, tensorflow/keras, httpx, pydantic-settings)
  ✔ criteria: `pip install -r backend/requirements.txt` berhasil di Python 3.10+
- [x] T0.3 Scaffold frontend Next.js (TypeScript, Tailwind, App Router,
  +recharts, +swr)
  ✔ criteria: `npm run dev` berjalan di :3000
- [x] T0.4 `.env.example` backend + frontend
- [x] T0.5 Finalisasi `.opencode/instruction.md`, `docs/requirements.md`,
  `docs/design.md`, `docs/tasks.md`
  ✔ criteria: 4 file ada dan konsisten dengan `PLAN.md`
- [ ] T0.6 `README.md` final (cara cepat menjalankan proyek)

## Fase 1 — Data & DB
- [ ] T1.1 DB layer: `backend/app/db/database.py` + `models.py`
  (SQLAlchemy 2.0, tabel `sensor_reading` sesuai design.md §4)
  ✔ criteria: tabel terbentuk saat first run
- [ ] T1.2 `backend/load_data.py`: Excel → DB, idempoten, validasi 1140 baris,
  normalisasi stage ke enum
  ✔ criteria: dijalankan 2× tetap 1140 baris; bisa via
  `python backend/load_data.py`
- [ ] T1.3 Query helpers: latest reading, N hari terakhir, paginasi + filter,
  rata-rata harian 30 hari
  ✔ criteria: callable bisa dipanggil dari REPL dengan hasil benar

## Fase 2 — Stage CNN
- [ ] T2.1 `ml/dataset.py`: loader 3 folder, validasi file korup (skip + log),
  augmentasi, seed deterministik
- [ ] T2.2 `ml/train_stage_cnn.py`: MobileNetV2 fine-tune, class_weight,
  EarlyStopping, stratified split
- [ ] T2.3 Evaluasi + artifact: `ml/artifacts/stage_cnn.keras` + `report.json`
  (akurasi, F1 per kelas, confusion matrix)
  ✔ criteria: artifact ada di `ml/artifacts/`; `report.json` valid JSON

## Fase 3 — Forecast Model
- [ ] T3.1 `ml/dataset.py`: agregasi harian (9 fitur, urutan sesuai
  design.md §5.2), sliding window 14→4, split kronologis, scaler
  (fit hanya training)
- [ ] T3.2 `ml/train_forecast.py`: bangun model fusion (LSTM + logits stage),
  pairing gambar sesuai aturan design.md §5.2, latih
  (MSE, Adam lr=1e-3, EarlyStopping patience=10)
- [ ] T3.3 Evaluasi + artifact: `forecast_model.keras`, `scaler.json`,
  `report.json` (MAE/RMSE/R² per target)
  ✔ criteria: metrik masuk akal; prediksi maturity tidak monoton turun

## Fase 4 — Backend API
- [ ] T4.1 `app/main.py` + `config.py` + CORS + load model saat startup
  + `GET /health`
- [ ] T4.2 `app/ml/forecast.py` (pipeline predict) + `app/ml/stage.py`
  (aturan DAP)
- [ ] T4.3 `GET /dashboard` (service + router)
- [ ] T4.4 `POST /predict/forecast` (termasuk fallback one-hot bila citra gagal)
- [ ] T4.5 `GET /history` + `GET /export.csv`
- [ ] T4.6 `POST /ai/chat` (OpenRouter + prompt konteks + fallback aturan)
  ✔ criteria tiap endpoint: skema respons sama persis dengan design.md §6

## Fase 5 — Frontend
- [ ] T5.1 `frontend/lib/api.ts` (typed client, base URL dari env)
- [ ] T5.2 Dashboard: `SensorCard`, `MaturityBar`, `StageBadge`, `TrendChart`,
  `ForecastPreview`
- [ ] T5.3 Prediction: `ForecastChart` (solid + dashed), `ForecastTable`,
  metrik + disclaimer
- [ ] T5.4 History: tabel paginasi, filter, tombol Export CSV
- [ ] T5.5 Assistant: `ChatBox` + `QuickActions` + handling error LLM
- [ ] T5.6 About: konten statis + metrik dari `/health`
  ✔ criteria: semua halaman punya state loading/error yang rapi;
  `tsc --noEmit` bersih

## Fase 6 — Testing
- [ ] T6.1 Unit test: `/health`, `/dashboard`, `/history` (paginasi + filter),
  `/predict/forecast` (termasuk fallback), `/export.csv`
- [ ] T6.2 Sanity check: forecast maturity monoton naik pada dataset ini
- [ ] T6.3 E2E lokal: `load_data` → (skip train jika artifact ada) → API →
  UI penuh

## Fase 7 — Deployment
- [ ] T7.1 `Dockerfile` backend (termasuk copy `ml/artifacts`)
- [ ] T7.2 Deploy: Vercel (UI) + Railway/Render (API) + Neon PostgreSQL
  + env vars
- [ ] T7.3 Verifikasi produksi: semua 6 endpoint + 5 halaman +
  latensi forecast < 3 detik
