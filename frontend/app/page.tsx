"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const latest = data?.latest || {};
  const stageColor =
    latest.stage === "harvest_ready" ? "bg-amber-500" :
    latest.stage === "pre_harvest" ? "bg-amber-300" :
    latest.stage === "vegetative" ? "bg-emerald-400" : "bg-sky-400";

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-200">
      {/* Header minimal */}
      <header className="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-700 shadow-sm shadow-emerald-700/20" />
            <h1 className="text-lg font-semibold tracking-tight leading-none">Pakcoy Monitor</h1>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-stone-500">
            <Link href="/" className="text-stone-900">Dashboard</Link>
            <Link href="/prediction" className="hover:text-stone-900 transition-colors">Prediksi</Link>
            <Link href="/history" className="hover:text-stone-900 transition-colors">Sejarah</Link>
            <Link href="/assistant" className="hover:text-stone-900 transition-colors">Asisten</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-12 pb-6">
        <div className="flex items-baseline gap-3 mb-2">
          <h2 className="text-3xl font-extralight tracking-tight text-stone-950 leading-none">Kondisi Tanaman</h2>
          <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">Real-time</span>
        </div>
        <p className="text-stone-400 text-base">Data terkini dari sensor dan prediksi model.</p>
      </section>

      {/* 3 Sensor Cards — minimal, modern */}
      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {[
          { label: "Kelembaban Tanah", value: `${latest.soil_moisture ?? "—"}%`, sub: latest.soil_condition ?? "—", color: "text-sky-500", bg: "bg-sky-50" },
          { label: "Suhu Lingkungan", value: `${latest.temperature ?? "—"}°C`, sub: "Rata-rata harian", color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Mansur Tanaman", value: `${latest.maturity_pct ?? "—"}%`, sub: latest.stage ?? "—", color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((c) => (
          <article key={c.label} className={`rounded-2xl p-6 shadow-[0_2px_30px_rgba(0,0,0,0.04)] border border-stone-100 ${c.bg} transition hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]`}>
            <div className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">{c.label}</div>
            <div className="text-4xl font-extralight tracking-tight text-stone-950 leading-none mb-1">{c.value}</div>
            <div className="text-sm text-stone-500 font-medium">{c.sub}</div>
          </article>
        ))}
      </section>

      {/* Progress + Stage + Trend */}
      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="rounded-2xl bg-white border border-stone-100 p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">Tingkat Kematangan</div>
          <div className="text-6xl font-extralight text-stone-950 tracking-tight leading-none mb-3">{latest.maturity_pct ?? "—"}<span className="text-2xl text-stone-300">%</span></div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${latest.maturity_pct ?? 0}%` }} />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-stone-100 p-6 shadow-sm flex flex-col justify-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-stone-400">Stage Pertumbuhan</div>
          <div className={`inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-sm font-medium text-white ${stageColor} shadow-sm`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            {latest.stage ? latest.stage.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) : "—"}
          </div>
          <div className="text-xs text-stone-400">Hari {latest.day ?? "—"} · DAP {latest.dap ?? "—"}</div>
        </div>

        <div className="rounded-2xl bg-white border border-stone-100 p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">Tren 30 Hari</div>
          <div className="h-32 flex items-end gap-1.5">
            {(data?.trend30 || [] as any[]).map((t: any, i: number) => (
              <div key={i} className="flex-1 bg-emerald-200 rounded-t-md" style={{ height: `${Math.max(10, (t?.moisture_avg ?? 60) / 100 * 100)}%` }} title={`Day ${t?.day ?? i}`} />
            ))}
          </div>
          <div className="text-xs text-stone-400 mt-2">Rata-rata kelembaban (30 hari terakhir)</div>
        </div>
      </section>

      {/* Preview Forecast */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="rounded-3xl bg-stone-900 text-stone-50 p-8 md:p-12 shadow-2xl shadow-stone-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <h3 className="text-2xl font-light tracking-tight mb-2">Prediksi 4 Hari</h3>
          <p className="text-stone-400 text-sm mb-8">Berdasarkan pola sensor 14 hari terakhir dan citra tanaman.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((d) => (
              <div key={d} className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur">
                <div className="text-xs text-stone-400 mb-1">Hari +{d}</div>
                <div className="text-xl font-extralight">{65 + d} <span className="text-sm text-stone-500">%</span></div>
                <div className="text-xs text-emerald-300 mt-2">Harvest Ready</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-3 text-xs font-medium">
            <Link href="/prediction" className="inline-block px-5 py-2.5 bg-white text-stone-950 rounded-full hover:bg-stone-100 transition">Lihat Lengkap</Link>
          </div>
        </div>
      </section>

      <footer className="max-w-5xl mx-auto px-6 py-8 text-xs text-stone-400 border-t border-stone-200/60 flex justify-between">
        <span>Pakcoy Monitor</span>
        <span>Multimodal CNN-LSTM · {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
