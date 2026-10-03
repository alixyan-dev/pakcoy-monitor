#!/usr/bin/env python3
"""Train Stage CNN 3-kelas dari folder foto."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
from tensorflow import keras
from ml.dataset import list_images, validate_images, make_augmentation
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix

# Dataset
paths, labels_raw = zip(*list_images())
# Label numerik
label_names = sorted(set(labels_raw))  # ['harvest_ready', 'initial', 'pre_harvest', 'vegetative']
label_map = {name: i for i, name in enumerate(label_names)}
y = np.array([label_map[l] for l in labels_raw])

# Load images (224x224, float32 0-1)
images = []
for p in paths:
    img = keras.utils.load_img(p, target_size=(224, 224))
    images.append(keras.utils.img_to_array(img) / 255.0)
X = np.stack(images)

# Split stratified 70/15/15
X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.30, stratify=y, random_state=42)
X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.50, stratify=y_temp, random_state=42)

# Augmentasi training (tidak digunakan pada val/test — kita augmented via layer di model)
# Untuk v1: gunakan layer augmentation di model (foto sudah cukup banyak untuk 137 gambar)
base = keras.applications.MobileNetV2(weights="imagenet", include_top=False, input_shape=(224,224,3))
base.trainable = False  # freeze dulu

inputs = keras.Input(shape=(224,224,3))
x = make_augmentation()(inputs)  # opsional — bisa dihapus jika terlalu agresif
x = keras.applications.mobilenet_v2.preprocess_input(x)
x = base(x, training=False)
x = keras.layers.GlobalAveragePooling2D()(x)
x = keras.layers.Dense(64, activation="relu")(x)
x = keras.layers.Dropout(0.3)(x)
outputs = keras.layers.Dense(len(label_names), activation="softmax", name="predictions")(x)

model = keras.Model(inputs, outputs)
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-4),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

# Class weights (imbalance: harvest_ready 64 vs others ~37)
from sklearn.utils.class_weight import compute_class_weight
class_weights = compute_class_weight("balanced", classes=np.unique(y_train), y=y_train)
class_weight_dict = dict(enumerate(class_weights))

# EarlyStopping
callbacks = [keras.callbacks.EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True)]

print("Train sample:", len(X_train), "| Val:", len(X_val), "| Test:", len(X_test))
print("Class names:", label_names)

model.fit(X_train, y_train, validation_data=(X_val, y_val),
          epochs=100, batch_size=8, class_weight=class_weight_dict,
          callbacks=callbacks, verbose=2)

# Evaluasi test
preds = np.argmax(model.predict(X_test, verbose=0), axis=1)
acc = accuracy_score(y_test, preds)
f1 = f1_score(y_test, preds, average="weighted")
cm = confusion_matrix(y_test, preds).tolist()

# Simpan artifact + report
os.makedirs("ml/artifacts", exist_ok=True)
model.save("ml/artifacts/stage_cnn.keras")

import json
report = {
    "model": "MobileNetV2_stage_cnn",
    "input_shape": [224,224,3],
    "classes": label_names,
    "test_accuracy": round(float(acc), 4),
    "test_f1_weighted": round(float(f1), 4),
    "confusion_matrix": cm,
    "n_samples": len(X), "train": len(X_train), "val": len(X_val), "test": len(X_test),
    "class_weights": {label_names[i]: round(float(class_weights[i]), 4) for i in range(len(label_names))},
}
with open("ml/artifacts/report_stage.json", "w") as f:
    json.dump(report, f, indent=2)

print("T2.2 OK — artifact: ml/artifacts/stage_cnn.keras | report: ml/artifacts/report_stage.json | test_acc=", round(acc,4))
