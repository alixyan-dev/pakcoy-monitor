# Pakcoy Monitor — Multimodal CNN-LSTM

Sistem web untuk memantau dan memprediksi pertumbuhan tanaman pakcoy secara cerdas. 
Menggabungkan **data sensor harian** (380 hari × 3 pengukuran) dan **citra tanaman** 
melalui model **Multimodal CNN-LSTM** yang menganalisis visual tanaman sekaligus 
polarisasi sensor dari waktu ke waktu.

## Apa yang Ada

| Komponen | Teknologi | Fungsi |
|---|---|---|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind, Recharts, SWR | Dashboard, Prediksi, Sejarah, Asisten AI, Tentang |
| **Backend** | FastAPI, SQLAlchemy 2.0, Pandas | API `/api/v1`, load data Excel, query DB, forecast pipeline |
| **ML — Stage CNN** | MobileNetV2 fine-tune (Keras) | Klasifikasi 3 stage dari foto tanaman |
| **ML — Forecast** | LSTM (64→32) + fusion Dense | Prediksi 4 hari ke depan (kelembaban, suhu, kematangan) |
| **DB** | SQLite (dev) / Neon PostgreSQL (prod) | 1140 baris sensor + paginasi + ekspor CSV |
| **AI Assistant** | OpenRouter (Llama 3.1 8B Instruct) | Chat kontekstual dengan data sensor + prediksi |

## Struktur Folder

```
pakcoy-monitor/
├── .opencode/instruction.md       # Aturan kerja AI & developer (wajib dibaca)
├── docs/
│   ├── requirements.md            # Kebutuhan sistem & kriteria (R1–R8)
│   ├── design.md                 # Arsitektur, skema DB, pipeline ML, kontrak API
│   ├── tasks.md                  # Checklist task per fase + completion criteria
│   └── system-description.txt    # Deskripsi sistem versi awal
├── PLAN.md                        # Rencana implementasi asal (sumber spec)
├── data/
│   ├── new Dataset_Pakcoy.xlsx   # 1140 baris (380 hari × 3 pengukuran)
│   └── images/
│       ├── masa-pertumbuhan/     # 44 foto (initial + vegetative)
│       ├── mendekati-panen/      # 43 foto (pre-harvest)
│       └── siap-panen/           # 71 foto (harvest-ready)
├── ml/
│   ├── dataset.py                 # Loader gambar + augmentasi
│   ├── train_stage_cnn.py         # CNN klasifikasi 3 kelas
│   ├── train_forecast.py          # LSTM + fusion head
│   ├── forecast_dataset.py        # Agregasi harian + sliding window
│   └── artifacts/
│       ├── stage_cnn.keras        # Model CNN (11 MB, v2 fine-tuned)
│       ├── forecast_model.keras   # Model forecast (470 KB)
│       ├── scaler_x.pkl / scaler_y.pkl
│       ├── report_stage.json      # Metrik CNN (test_acc ~37%, data kecil)
│       └── report_forecast.json   # Metrik forecast (MAE 0.045, R² 0.846)
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI + load model saat startup
│   │   ├── db/                    # SQLAlchemy 2.0 + SQL model
│   │   ├── services/              # Dashboard, query, predict, AI chat
│   │   ├── routers/               # /health, /dashboard, /predict, /history, /ai
│   │   └── ml/                    # Forecast pipeline + stage mapping
│   ├── load_data.py               # Excel → DB (idempoten)
│   └── requirements.txt
└── frontend/
    ├── app/                       # App Router: /, /prediction, /history, /assistant, /about
    ├── components/                # SensorCard, MaturityBar, TrendChart, ForecastChart
    └── lib/api.ts                 # Typed client untuk backend

## Status Proyek

- **Fase 0–6**: Selesai (Setup → Testing)
- **Fine-tuning CNN v2**: Selesai (`stage_cnn.keras` diperbarui 11 MB, unfreeze backbone, 50 epoch, lr 5e-5)
- **Dataset**: 195 foto valid (21 baru dari `data-foto-baru` + anotasi COCO dipindahkan ke cluster)
- **API**: Semua 6 endpoint `/api/v1` aktif dan diuji
- **Frontend**: 5 halaman minimalis-modern (build berhasil, static prerendered)

## Menjalankan Lokal

```bash
# 1. Backend (port 8000)
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
python backend/load_data.py        # import Excel → SQLite
uvicorn backend.app.main:app --reload

# 2. Frontend (port 3000)
cd frontend
npm install
cp .env.example .env.local        # NEXT_PUBLIC_API_BASE
npm run dev
```

Buka http://localhost:3000 — API di http://localhost:8000/docs.

## Catatan Penting

- **Dataset CNN masih kecil** (195 foto, 27 sampel test) → akurasi 37% wajar; kenaikan signifikan memerlukan **foto per stage terpisah** (bukan hanya ukuran), bukan hanya hyperparameter.
- **Transformasi data**: `data-foto-baru/` → dipindahkan ke 3 folder cluster berdasarkan label COCO (`Large` → siap-panen, `Median` → mendekati-panen, `Small/Bok-Choy` → masa-pertumbuhan).
- **Fine-tuning v2** sudah dijalankan: unfreeze MobileNetV2 + augmentasi lebih kuat + lr 5e-5.

## Deployment (Referensi)

- **Frontend**: Vercel
- **Backend**: Railway / Render (Docker, artifact model ter-copy)
- **DB Produksi**: Neon PostgreSQL
- **LLM**: OpenRouter (VIP/free tier)

---
*Dokumentasi lengkap: `.opencode/instruction.md` (aturan kerja AI) + `docs/design.md` (arsitektur detail).* 
