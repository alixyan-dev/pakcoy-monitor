#!/usr/bin/env python3
"""Evaluasi cepat + artifact simulasi dari data yang sudah tersedia.
Untuk v1: jika model belum selesai dilatih, scrip ini membuat artifact placeholder
berbasis statistik folder yang sudah terverifikasi, sehingga pipeline lengkap."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.dataset import list_images, validate_images
from collections import Counter

items = list_images()
labels = [l for _, l in items]
c = Counter(labels)
label_names = sorted(c.keys())

# Simulasi report berdasarkan distribusi gambar (referensi validasi)
# Ini hanya placeholder sampai train_stage_cnn.py selesai (meski proses sudah jalan)
report = {
    "model": "MobileNetV2_stage_cnn",
    "input_shape": [224, 224, 3],
    "classes": label_names,
    "n_samples": len(items),
    "distribution": {k: v for k, v in sorted(c.items())},
    "status": "training_in_progress",
    "note": "Artifact stage_cnn.keras akan dihasilkan oleh train_stage_cnn.py setelah selesai (proses aktif).",
    "test_accuracy_estimated": None,
    "test_f1_weighted_estimated": None,
}
with open("ml/artifacts/report_stage.json", "w") as f:
    json.dump(report, f, indent=2)

print("T2.3 — report placeholder (proses train masih aktif):")
print("  Gambar valid:", len(items), "| Distribusi:", dict(sorted(c.items())))
print("  Artifact report_stage.json tersimpan.")
print("  Tunggu train_stage_cnn.py selesai untuk stage_cnn.keras.")
