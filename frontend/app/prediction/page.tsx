import Link from "next/link";
import ForecastChart from "@/components/ui/forecast-chart";

export default function PredictionPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-emerald-200">
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">Prediksi</h1>
          
        </div>
      </header>
      <section className="max-w-5xl mx-auto px-6 pt-12">
        <h2 className="text-3xl font-extralight tracking-tight mb-4">Prediksi 4 Hari</h2>
        <p className="text-stone-400 mb-10">Berdasarkan data sensor 14 hari dan citra tanaman saat ini.</p>
        <div className="rounded-3xl bg-white border border-stone-100 p-8 shadow-sm mb-6">
          <div className="flex items-end gap-8 h-48">
            {[1,2,3,4].map((d) => (
              <div key={d} className="flex-1 flex flex-col justify-end gap-2">
                <div className="text-xs text-stone-400 text-center">+{d}h</div>
                <div className="h-24 rounded-t-xl bg-emerald-100" style={{ height: `${60+d*10}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-4 gap-4 text-sm text-zinc-400">
            {[
              {label:"Kelembaban", val:"65%"},
              {label:"Suhu", val:"28°C"},
              {label:"Mansur", val:"100%"},
              {label:"Stage", val:"Harvest Ready"},
            ].map(c => (
              <div key={c.label} className="p-3 rounded-xl bg-[#09090b] border border-stone-100">
                <div className="text-xs text-stone-400">{c.label}</div>
                <div className="font-medium text-zinc-50">{c.val}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5 text-sm text-stone-700 leading-relaxed">
          <strong className="text-amber-700">Catatan:</strong> Prediksi berbasis tren historis 14 hari dan citra terkini. Kondisi cuaca eksternal tidak dimasukkan. Untuk akurasi lebih baik, pastikan foto tanaman diambil pada kondisi pencahayaan merata.
        </div>
      </section>
    </main>
  );
}
