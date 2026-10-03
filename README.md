# Pakcoy Monitor

Sistem web untuk memantau dan memprediksi pertumbuhan tanaman pakcoy menggunakan
model Multimodal CNN-LSTM (Stage CNN 3-kelas + LSTM sensor time-series), dashboard
interaktif, dan AI Assistant.

## Dokumen

- `.opencode/instruction.md` — aturan kerja AI & developer (WAJIB baca sebelum
  menulis kode / commit / push)
- `docs/requirements.md` — kebutuhan & kriteria penerimaan sistem
- `docs/design.md` — arsitektur, skema DB, pipeline ML, kontrak API
- `docs/tasks.md` — checklist task per fase + completion criteria
- `PLAN.md` — rencana implementasi asal (sumber spec; bagian threshold stage &
  pairing citra sudah digantikan oleh dokumen docs/*)
- `docs/system-description.txt` — deskripsi sistem versi awal

## Struktur

```
data/       dataset Excel + 3 folder foto (137 gambar)
ml/         skrip training offline & artifact model
backend/    FastAPI (API, load_data, predict, ai chat)
frontend/   Next.js (Dashboard, Prediction, History, AI Assistant, About)
```

Status: skel awal — pengembangan mengikuti fase di `docs/tasks.md`
(mulai Fase 0: Setup).
