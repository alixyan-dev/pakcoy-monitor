# Pakcoy Monitor

Sistem web untuk memantau dan memprediksi pertumbuhan tanaman pakcoy menggunakan
model Multimodal CNN-LSTM (Stage CNN 3-kelas + LSTM sensor time-series), dashboard
interaktif, dan AI Assistant.

## Dokumen

| File | Isi |
|---|---|
| `.opencode/instruction.md` | Aturan kerja AI & developer — **wajib dibaca** sebelum menulis kode / commit / push |
| `docs/requirements.md` | Kebutuhan sistem & kriteria penerimaan (R1–R8) |
| `docs/design.md` | Arsitektur, skema DB, pipeline ML, kontrak API |
| `docs/tasks.md` | Checklist task per fase + completion criteria |
| `PLAN.md` | Rencana implementasi asal (sumber spec) |
| `docs/system-description.txt` | Deskripsi sistem versi awal |

## Prasyarat

- Python 3.10+
- Node.js 18+

## Menjalankan Proyek

```bash
# 1. Setup backend
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env      # lalu isi (opsional untuk dev)

# 2. Import data Excel → database
python backend/load_data.py

# 3. Train model (sekali saja, hasil disimpan di ml/artifacts/)
python ml/train_stage_cnn.py
python ml/train_forecast.py

# 4. Jalankan API (port 8000)
uvicorn backend.app.main:app --reload

# 5. Setup & jalankan frontend (port 3000)
cd frontend
npm install
cp .env.example .env.local                # NEXT_PUBLIC_API_BASE
npm run dev
```

Buka http://localhost:3000 — API tersedia di http://localhost:8000/docs.

## Halaman

- **Dashboard** (`/`) — sensor terkini, progress kematangan, badge stage, tren 30 hari, preview forecast
- **Prediction** (`/prediction`) — forecast 4 hari (grafik solid + putus-putus) + metrik model
- **History** (`/history`) — arsip data paginasi + filter + ekspor CSV
- **AI Assistant** (`/assistant`) — chat kontekstual + quick actions
- **About** (`/about`) — metodologi & kredit

## Struktur

```
data/       dataset Excel + 3 folder foto (137 gambar)
ml/         skrip training offline & artifact model
backend/    FastAPI (API, load_data, predict, ai chat)
frontend/   Next.js (App Router, TypeScript, Tailwind, Recharts, SWR)
```

## Deployment

- Frontend → Vercel · Backend → Railway/Render (Docker) · DB produksi → Neon PostgreSQL
- Detail: `docs/design.md` §9

## Status

Skel awal — pengembangan mengikuti fase di `docs/tasks.md`.
