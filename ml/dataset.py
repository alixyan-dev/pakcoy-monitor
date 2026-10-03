"""Dataset loader dan validasi gambar Stage CNN."""
import os, random
from pathlib import Path
from PIL import Image

ROOT = Path("data/images")
CLASSES = {
    "initial": ROOT / "masa-pertumbuhan",
    "vegetative": ROOT / "masa-pertumbuhan",
    "pre_harvest": ROOT / "mendekati-panen",
    "harvest_ready": ROOT / "siap-panen",
}

def list_images():
    results = []
    for label, folder in CLASSES.items():
        if not folder.exists():
            continue
        for f in folder.iterdir():
            if f.suffix.lower() in (".jpg", ".jpeg", ".png"):
                results.append((str(f), label))
    return results

def validate_images():
    bad = []
    for path, label in list_images():
        try:
            img = Image.open(path)
            img.verify()  # cek file tidak korup
            img.close()
        except Exception as e:
            bad.append((path, str(e)))
    return bad

# Augmentasi sederhana (akan dipakai oleh train_stage_cnn.py)
from tensorflow import keras

def make_augmentation():
    return keras.Sequential([
        keras.layers.RandomFlip("horizontal"),
        keras.layers.RandomRotation(0.15),
        keras.layers.RandomBrightness(0.2),
        keras.layers.RandomContrast(0.15),
    ])
