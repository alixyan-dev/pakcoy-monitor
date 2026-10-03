import Link from "next/link";
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-emerald-200">
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">Tentang</h1>
          
        </div>
      </header>
      <section className="max-w-3xl mx-auto px-6 pt-12 text-sm leading-7 text-stone-600">
        <h2 className="text-3xl font-extralight tracking-tight text-stone-950 mb-6">Metodologi</h2>
        <p className="mb-4">Sistem ini menggabungkan <strong>data sensor harian</strong> (380 hari × 3 pengukuran) dengan <strong>foto tanaman</strong> melalui model <em>Multimodal CNN-LSTM</em>. CNN menganalisis citra (3 kelas: pertumbuhan, mendekati panen, siap panen). LSTM membaca pola waktu 14 hari untuk memprediksi kondisi 4 hari ke depan.</p>
        <p className="mb-4">Dataset: 1140 baris Excel + 137 foto. Model dilatih dengan split kronologis 70/15/15, early stopping (patience 10), dan augmentasi gambar. Model disimpan dalam format Keras (<code>.keras</code>) bersama scaler.</p>
        <h3 className="text-xl font-medium text-stone-950 mt-10 mb-3">Metrik Model</h3>
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-white border border-stone-100 shadow-sm"><div className="text-xs text-stone-400">Stage CNN</div><div className="text-2xl font-extralight">0.37</div><div className="text-xs text-stone-400">test accuracy</div></div>
          <div className="p-4 rounded-2xl bg-white border border-stone-100 shadow-sm"><div className="text-xs text-stone-400">Forecast MAE</div><div className="text-2xl font-extralight">0.045</div><div className="text-xs text-stone-400">mean absolute error</div></div>
          <div className="p-4 rounded-2xl bg-white border border-stone-100 shadow-sm"><div className="text-xs text-stone-400">Forecast R²</div><div className="text-2xl font-extralight">0.85</div><div className="text-xs text-stone-400">coefficient of determination</div></div>
        </div>
        <p className="text-xs text-stone-400">License: MIT-style · Dibuat untuk pembelajaran & riset pertanian cerdas.</p>
      </section>
    </main>
  );
}
