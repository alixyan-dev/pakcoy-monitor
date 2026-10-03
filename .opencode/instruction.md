# Project Instructions (Wajib Baca — AI & Developer)

## 1. Aturan Emas: Baca Dulu, Baru Menulis
SEBELUM menulis kode ATAU melakukan git commit/push, AI/developer WAJIB membaca:
1. `docs/requirements.md` — apa yang harus dilakukan & kriterianya
2. `docs/design.md` — bagaimana: arsitektur, skema DB, pipeline ML, kontrak API
3. `docs/tasks.md` — posisi kerja saat ini (task aktif, task selesai)

Aturan tambahan:
- Implementasi harus mengikuti `docs/design.md` secara literal (nama endpoint,
  skema JSON, arsitektur model, aturan stage). Jika design.md kurang jelas →
  tanya dulu, jangan menebak.
- Jika kode baru, data, atau konfigurasi menyebabkan `docs/requirements.md` /
  `docs/design.md` menjadi tidak akurat → perbarui file tersebut dalam commit
  yang sama.
- `docs/tasks.md` hanya boleh di-check [x] jika semua completion criteria
  task itu terpenuhi.

## 2. Rule of Law Repository
- `data/` bersifat READ-ONLY: jangan edit, hapus, atau rename file Excel/foto.
- Model artifacts (`*.keras`, `scaler.json`, `report.json`) HANYA dihasilkan oleh
  skrip di `ml/`. Jangan pernah mengedit manual.
- Semua pemanggilan model & API key LLM berada di backend. Frontend DILARANG
  mengandung secret atau logika ML.
- Enum stage bersifat global & fixed:
  `initial | vegetative | pre_harvest | harvest_ready`
  (cara menentukan stage: dari DAP, lihat design.md §5.3).
- Kontrak API: prefix `/api/v1`. Mengubah skema request/response = update
  design.md §6 di commit yang sama.

## 3. Gaya Kode
### Python (backend/, ml/) — Python 3.10+
- PEP 8; type hints di semua fungsi; docstring di semua modul & fungsi publik.
- Nama: snake_case (file/fungsi/variabel), PascalCase (kelas), UPPERCASE (konstanta).
- DB: hanya lewat helper di `backend/app/db/` — jangan raw SQL tersebar.
- Error: `HTTPException` dengan status code spesifik (404/422/500); log error tak
  terduga dengan modul `logging`; jangan swallow exception silently.
- ML: setiap skrip train harus (a) deterministik (seed), (b) menyimpan artifact +
  `report.json`, (c) bisa dijalankan ulang dari repo bersih.

### TypeScript / Next.js (frontend/)
- TypeScript strict mode; Next.js App Router (DILARANG pages router).
- fetch API hanya lewat `frontend/lib/api.ts` (typed) — jangan fetch inline di page.
- Komponen di `frontend/components/` (PascalCase.tsx); state fetching memakai SWR.
- Styling: Tailwind CSS saja, tanpa CSS-in-JS / CSS module.

## 4. Aturan Git
- Bekerja di branch `main`; satu commit per task `docs/tasks.md`
  (jangan campur task berbeda).
- Format pesan commit (bahasa Inggris, imperatif):
  ```
  <type>(<scope>): <ringkasan>
    feat(backend): add /api/v1/dashboard endpoint
    fix(frontend): handle missing image in forecast
  ```
  - type: `feat | fix | refactor | test | docs | chore`
  - scope: `ml | backend | frontend | data | docs`
- CHECKLIST SEBELUM COMMIT:
  1. Baca ulang task terkait di `docs/tasks.md` → semua completion criteria terpenuhi?
  2. Tidak ada file rahasia (`.env`, API key) di diff?
  3. `docs/design.md` / `docs/requirements.md` / `docs/tasks.md` konsisten dengan
     kode yang di-commit?
- CHECKLIST SEBELUM PUSH:
  1. `docs/tasks.md` sudah di-update (task dicentang) dan commit-nya ter-include?
  2. Lint/type-check backend (`ruff` / `mypy`, bila sudah dikonfigurasi) &
     frontend (`tsc --noEmit` / `next lint`) lolos?
- Jangan pernah commit: `.env`, `*.db` (file SQLite), `__pycache__`,
  `node_modules`, `.next`

## 5. Definisi "Selesai" (per task)
- Kode berjalan sesuai completion criteria di `docs/tasks.md`
- Tidak melanggar aturan §1–§4
- `docs/tasks.md` ter-update; commit message mengikuti §4

## 6. Perintah Eksekusi (setelah Fase 0–1 selesai)
```bash
python backend/load_data.py            # import data Excel → DB
python ml/train_stage_cnn.py           # train Stage CNN
python ml/train_forecast.py            # train Forecast Model
uvicorn backend.app.main:app --reload  # jalankan API (port 8000)
npm run dev                            # jalankan UI (port 3000, dari frontend/)
```
