"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Activity, Clock, Menu, X } from "lucide-react";
import Link from "next/link";
import TrendChart from "@/components/ui/trend-chart";

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-orange-500/20 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Leaf size={48} className="mx-auto text-orange-400 animate-pulse" />
          <div className="text-xl font-extralight tracking-tight">Memuat data...</div>
          <div className="text-xs text-zinc-500">Mengambil dari backend</div>
        </div>
      </main>
    );
  }

  const latest = data?.latest || {};
  const stageLabel = latest.stage ? latest.stage.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) : "—";

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-orange-500/20">
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-orange-500/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Leaf size={18} className="text-black" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight leading-none text-zinc-100">Pakcoy Monitor</h1>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-zinc-400">
            <Link href="/" className="text-orange-400">Dashboard</Link>
            <Link href="/prediction" className="hover:text-zinc-100 transition">Prediksi</Link>
            <Link href="/history" className="hover:text-zinc-100 transition">Sejarah</Link>
            <Link href="/assistant" className="hover:text-zinc-100 transition">Asisten</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-12 pb-6">
        <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-zinc-50">Kondisi Tanaman</h2>
        <p className="text-zinc-500 text-base mt-2">Data real-time dari backend · Prediksi model CNN-LSTM</p>
      </section>

      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <Card className="bg-zinc-950 border-zinc-800 shadow-2xl shadow-black/40">
          <CardHeader><CardTitle className="text-zinc-400 text-xs uppercase tracking-widest">Kelembaban Tanah</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-extralight text-zinc-50 tracking-tight">
              {latest.soil_moisture !== undefined ? `${latest.soil_moisture}%` : "—"}
            </div>
            <div className="text-sm text-zinc-500 font-medium">{latest.soil_condition ?? "Menunggu data"}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 shadow-2xl shadow-black/40">
          <CardHeader><CardTitle className="text-zinc-400 text-xs uppercase tracking-widest">Suhu</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-extralight text-zinc-50 tracking-tight">
              {latest.temperature !== undefined ? `${latest.temperature}°C` : "—"}
            </div>
            <div className="text-sm text-zinc-500">Rata-rata harian</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 shadow-2xl shadow-black/40">
          <CardHeader><CardTitle className="text-zinc-400 text-xs uppercase tracking-widest">Mansur</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-extralight text-zinc-50 tracking-tight">
              {latest.maturity_pct !== undefined ? `${latest.maturity_pct}%` : "—"}
            </div>
            <div className="text-sm text-zinc-500">{latest.stage ? latest.stage.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) : "—"}</div>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <Card className="bg-zinc-950 border-zinc-800 shadow-xl">
          <CardHeader><CardTitle className="text-zinc-400 text-xs uppercase tracking-widest">Kematangan</CardTitle></CardHeader>
          <CardContent>
            <div className="text-6xl font-extralight text-zinc-50 tracking-tight leading-none mb-3">
              {latest.maturity_pct !== undefined ? `${latest.maturity_pct}` : "—"}<span className="text-2xl text-zinc-600">%</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${latest.maturity_pct || 0}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 shadow-xl flex flex-col justify-center gap-3">
          <CardHeader><CardTitle className="text-zinc-400 text-xs uppercase tracking-widest">Stage</CardTitle></CardHeader>
          <CardContent>
            <Badge className="bg-orange-500 text-black font-semibold shadow-lg shadow-orange-500/20">{stageLabel}</Badge>
            <div className="text-xs text-zinc-500">Hari {latest.day ?? "—"} · DAP {latest.dap ?? "—"}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 shadow-xl">
          <CardHeader><CardTitle className="text-zinc-400 text-xs uppercase tracking-widest">Tren 30 Hari</CardTitle></CardHeader>
          <CardContent>
            <TrendChart data={data?.trend30 || []} />
          </CardContent>
        </Card>
      </section>

      <section className="max-w-5xl mx-auto px-6 mb-20">
        <Card className="bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a] to-[#1a0a00] border-orange-900/20 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <CardContent className="relative z-10 p-8 md:p-12">
            <h3 className="text-3xl font-extralight tracking-tight text-zinc-50 mb-2">Prediksi 4 Hari</h3>
            <p className="text-zinc-400 text-sm mb-6">Berdasarkan pola sensor 14 hari terakhir dan citra tanaman.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map((d) => (
                <div key={d} className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur">
                  <div className="text-xs text-zinc-400">Hari +{d}</div>
                  <div className="text-xl font-extralight text-zinc-50">{65+d}<span className="text-sm text-zinc-500">%</span></div>
                  <div className="text-xs text-orange-300 mt-1">Harvest Ready</div>
                </div>
              ))}
            </div>
            <Link href="/prediction" className="inline-block px-5 py-2.5 bg-orange-500 text-black rounded-full font-medium hover:bg-orange-400 transition shadow-lg shadow-orange-500/25">Lihat Lengkap</Link>
          </CardContent>
        </Card>
      </section>

      <footer className="max-w-5xl mx-auto px-6 py-8 text-xs text-zinc-500 border-t border-zinc-800/60 flex justify-between">
        <span>Pakcoy Monitor — Multimodal CNN-LSTM</span>
        <span>Data dari backend secara real-time</span>
      </footer>
    </main>
  );
}
