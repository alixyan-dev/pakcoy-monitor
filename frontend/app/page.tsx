"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Menu, Leaf } from "lucide-react";
import Link from "next/link";
import TrendChart from "@/components/ui/trend-chart";

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-orange-500/20">
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-orange-500/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/30"><Leaf size={18} className="text-black" /></div>
            <h1 className="text-lg font-semibold tracking-tight leading-none text-zinc-100">Pakcoy Monitor</h1>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-zinc-400">
            {["Dashboard","Prediksi","Sejarah","Asisten","Tentang"].map((label,i) => (
              <Link key={label} href={i===0?"/":"/prediction"} className={`hover:text-orange-400 transition-colors ${i===0?"text-orange-400":""}`}>{label}</Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-12 pb-4">
        <div className="flex items-baseline gap-3 mb-2">
          <h2 className="text-3xl md:text-5xl font-extralight tracking-tighter leading-none text-zinc-50">Kondisi Tanaman</h2>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.2em]">Real-time</span>
        </div>
        <p className="text-zinc-500 text-base">Data sensor terkini · Prediksi 4 hari ke depan · Rekomendasi AI</p>
      </section>

      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <Card className="bg-zinc-950 border-zinc-800 shadow-2xl shadow-black/40">
          <CardHeader><CardTitle className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">Kelembaban Tanah</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-extralight text-zinc-50">68%</div><div className="text-sm text-zinc-500">Optimal · Wet indicator</div></CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 shadow-2xl shadow-black/40">
          <CardHeader><CardTitle className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">Suhu</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-extralight text-zinc-50">29°</div><div className="text-sm text-zinc-500">Rata-rata harian</div></CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 shadow-2xl shadow-black/40">
          <CardHeader><CardTitle className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">Mansur</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-extralight text-zinc-50">100%</div><div className="text-sm text-zinc-500">Harvest Ready</div></CardContent>
        </Card>
      </section>

      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <Card className="bg-zinc-950 border-zinc-800 shadow-xl">
          <CardHeader><CardTitle className="text-zinc-400 text-xs uppercase tracking-widest">Kematangan</CardTitle></CardHeader>
          <CardContent>
            <div className="text-6xl font-extralight text-zinc-50 tracking-tighter">100<span className="text-2xl text-zinc-600">%</span></div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mt-3"><div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{width:"100%"}} /></div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 shadow-xl flex flex-col justify-center gap-3">
          <CardHeader><CardTitle className="text-zinc-400 text-xs uppercase tracking-widest">Stage</CardTitle></CardHeader>
          <CardContent>
            <Badge className="bg-orange-500 text-black font-semibold shadow-lg shadow-orange-500/20">Harvest Ready</Badge>
            <div className="text-xs text-zinc-500">Day 380 · DAP 389</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 shadow-xl">
          <CardHeader><CardTitle className="text-zinc-400 text-xs uppercase tracking-widest">Tren 30 Hari</CardTitle></CardHeader>
          <CardContent>
            <div className="h-32 flex items-end gap-1.5">
              {[70,75,72,78,74,76,80,82,85,88,90,92,95,97,96,98,99,100,100,100,100,98,100,99,100,100,100,100,100,100].map((v,i)=><div key={i} className="flex-1 bg-gradient-to-t from-orange-600 to-amber-300 rounded-t-md opacity-90" style={{height:`${v}%`}} />)}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-5xl mx-auto px-6 mb-20">
        <Card className="bg-gradient-to-br from-zinc-950 via-[#0a0a0a] to-[#1a0a00] border-orange-900/20 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <CardContent className="relative z-10 p-8 md:p-12">
            <h3 className="text-3xl font-extralight tracking-tight text-zinc-50 mb-2">Prediksi 4 Hari</h3>
            <p className="text-zinc-400 text-sm mb-8">Berdasarkan pola sensor 14 hari terakhir dan citra tanaman.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map((d)=> (
                <div key={d} className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur">
                  <div className="text-xs text-zinc-400">Hari +{d}</div>
                  <div className="text-xl font-extralight text-zinc-50">{65+d}<span className="text-sm text-zinc-500">%</span></div>
                  <div className="text-xs text-orange-300 mt-1">Harvest Ready</div>
                </div>
              ))}
            </div>
            <Link href="/prediction" className="inline-block px-6 py-2.5 bg-orange-500 text-black rounded-full font-medium hover:bg-orange-400 transition shadow-lg shadow-orange-500/25">Lihat Lengkap</Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
