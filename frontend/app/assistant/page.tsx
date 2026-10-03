import Link from "next/link";
export default function AssistantPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-emerald-200">
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">Asisten AI</h1>
          
        </div>
      </header>
      <section className="max-w-3xl mx-auto px-6 pt-12">
        <h2 className="text-3xl font-extralight tracking-tight mb-2">Tanya Kondisi Tanaman</h2>
        <p className="text-stone-400 mb-10">Konteks sensor + prediksi 4 hari otomatis dikirim ke model.</p>
        <div className="rounded-3xl bg-white border border-stone-100 shadow-sm p-6 mb-4">
          <div className="flex gap-3 mb-4">
            <button className="px-3 py-1.5 rounded-full bg-stone-900 text-white text-xs font-medium">Analisis Kondisi</button>
            <button className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-medium">Saran Penyiraman</button>
            <button className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-medium">Prediksi Panen</button>
          </div>
          <div className="bg-[#09090b] rounded-xl p-4 text-sm leading-relaxed text-stone-700">
            <strong className="text-zinc-50">Asisten:</strong> Kelembaban tanah saat ini <span className="font-medium text-emerald-600">68%</span> (Optimal). Prediksi 4 hari ke depan menunjukkan kematangan naik ke <span className="font-medium">100%</span> dengan stage <span className="font-medium">Harvest Ready</span>. Disarankan mempertahankan kelembaban dan menjadwalkan panen dalam 2–3 hari.
          </div>
        </div>
      </section>
    </main>
  );
}
