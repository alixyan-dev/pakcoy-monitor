# Requirements — Website Monitoring Pakcoy
(Diambil dari `PLAN.md` — bagian "APA". Lihat `docs/design.md` untuk "bagaimana".)

## R1. Dataset (input, fixed)
- R1.1 Data sensor: Excel `data/new Dataset_Pakcoy.xlsx`, 1140 baris
  (380 hari × 3 pengukuran: 08:00/12:00/16:00), 8 kolom sesuai design.md §4.
- R1.2 Citra: 137 foto dalam 3 cluster:
  `masa-pertumbuhan` (37), `mendekati-panen` (36), `siap-panen` (64).

## R2. Dashboard
- R2.1 Kartu sensor terakhir: hari, jam, kelembaban (%), suhu (°C), kondisi tanah.
- R2.2 Warna kartu: Optimal=hijau, Wet=biru, Dry=merah.
- R2.3 Progress bar kematangan (%) + badge stage.
- R2.4 Grafik tren 30 hari terakhir (kelembaban & suhu, rata-rata harian).
- R2.5 Preview forecast 4 hari + tautan ke `/prediction`.

## R3. Prediction
- R3.1 Forecast 4 hari ke depan: kelembaban, suhu, kematangan per hari + stage.
- R3.2 Grafik: garis solid 14 hari histori + garis putus-putus 4 hari forecast.
- R3.3 Tabel detail angka per hari prediksi.
- R3.4 Tampilkan metrik model (MAE/RMSE/R²) + disclaimer keterbatasan prediksi.
- R3.5 Jika citra tidak tersedia: fallback one-hot stage terakhir (tetap berhasil).

## R4. History
- R4.1 Tabel paginasi (default limit 20, max 100).
- R4.2 Filter: rentang hari, stage, kondisi tanah.
- R4.3 Ekspor CSV seluruh data (menghormati filter aktif).

## R5. AI Assistant
- R5.1 Chat kontekstual: jawaban dipersonalisasi dari data terkini + forecast 4 hari
  (konteks di-inject backend SEBELUM memanggil LLM).
- R5.2 Quick Actions: Analisis Kondisi, Saran Penyiraman, Prediksi Panen, Peringatan Dini.
- R5.3 Jika LLM gagal / rate-limit → fallback rekomendasi berbasis aturan
  (contoh: kelembaban < 55% → saran menyiram).

## R6. About
- R6.1 Halaman statis (tujuan, metodologi, dataset, kredit) + metrik model dari API.

## R7. Model (ringkas — detail di design.md §5)
- R7.1 Stage CNN 3-kelas (MobileNetV2 fine-tune) → artifact `stage_cnn.keras`.
- R7.2 Forecast model: LSTM(64→32) + concat logits stage (3) → Dense(64) →
  Dropout(0.3) → Dense(12); input 14×9; output 4×(moisture, temp, maturity).
- R7.3 363 sample, split KRONOLOGIS 70/15/15.
- R7.4 Evaluasi MAE/RMSE/R² per target → `report.json`.

## R8. Non-Fungsional
- R8.1 API key & logika LLM hanya di backend (tidak bocor ke client).
- R8.2 DB-agnostic: SQLite (dev) / PostgreSQL (prod) via SQLAlchemy.
- R8.3 Error ditampilkan ramah ke user (tidak ada stacktrace mentah).
- R8.4 Latensi inference forecast < 3 detik di CPU server.
