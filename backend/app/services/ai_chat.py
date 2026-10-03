import os, requests
from fastapi import APIRouter

router = APIRouter()

@router.post("/ai/chat")
def chat(message: dict):
    # Konteks: ambil latest dari DB (sederhana — akan diperkaya dengan query helpers)
    # Untuk v1: balas dengan rekomendasi berbasis aturan jika LLM belum terhubung
    msg = message.get("message", "")
    # Fallback rule-based (jika API key tidak tersedia atau gagal)
    reply = f"AI Assistant (v1): Anda bertanya: '{msg}'. Rekomendasi akan dibangun dari konteks sensor terkini + prediksi 4 hari + data stage saat LLM aktif. Untuk saat ini: periksa kelembaban tanah (>55% = Optimal, <55% = disarankan menyiram)."
    # Coba OpenRouter jika API key tersedia
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if api_key:
        try:
            resp = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": os.environ.get("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free"),
                    "messages": [{"role":"user","content":msg}],
                },
                timeout=15,
            )
            if resp.status_code == 200:
                data = resp.json()
                reply = data.get("choices", [{}])[0].get("message", {}).get("content", reply)
        except Exception:
            pass  # tetap fallback
    return {"reply": reply}
