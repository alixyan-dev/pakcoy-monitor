import Link from "next/link";
export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-200">
      <header className="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">Sejarah</h1>
          <nav className="flex gap-6 text-sm font-medium text-stone-500"><Link href="/" className="hover:text-stone-900">Dashboard</Link><Link href="/prediction" className="hover:text-stone-900">Prediksi</Link><Link href="/history" className="text-stone-900">Sejarah</Link></nav>
        </div>
      </header>
      <section className="max-w-5xl mx-auto px-6 pt-12">
        <h2 className="text-3xl font-extralight tracking-tight mb-8">Arsip Pengamatan</h2>
        <div className="overflow-x-auto rounded-2xl border border-stone-100 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="text-xs font-medium text-stone-400 uppercase tracking-widest bg-stone-50 border-b border-stone-100">
              <tr><th className="px-4 py-3 text-left">Hari</th><th>Waktu</th><th>Kelembaban</th><th>Suhu</th><th>Kondisi</th><th>Stage</th></tr>
            </thead>
            <tbody>
              {[{day:380,time:"16:00",m:68,t:29.0,c:"Optimal",s:"Harvest Ready"},
                {day:379,time:"16:00",m:67,t:28.8,c:"Optimal",s:"Harvest Ready"},
                {day:378,time:"16:00",m:66,t:28.7,c:"Wet",s:"Harvest Ready"}].map((r,i)=> (
                <tr key={i} className="border-b border-stone-50 hover:bg-emerald-50/40 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.day}</td><td className="px-4 py-3 text-stone-500">{r.time}</td>
                  <td className="px-4 py-3">{r.m}%</td><td className="px-4 py-3">{r.t}°C</td>
                  <td className="px-4 py-3"><span className={`inline-block w-2 h-2 rounded-full mr-2 ${r.c=="Wet"?"bg-sky-400":r.c=="Dry"?"bg-red-400":"bg-emerald-400"}`}/>{r.c}</td>
                  <td className="px-4 py-3 text-stone-500">{r.s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 rounded-full bg-stone-900 text-white text-sm font-medium">Ekspor CSV</button>
          <button className="px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-600 text-sm font-medium">Filter</button>
        </div>
      </section>
    </main>
  );
}
