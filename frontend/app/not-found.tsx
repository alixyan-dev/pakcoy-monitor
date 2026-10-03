import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 flex flex-col items-center justify-center gap-4 font-sans">
      <h1 className="text-6xl font-extralight tracking-tighter text-stone-200">404</h1>
      <p className="text-stone-500">Halaman belum tersedia.</p>
      <Link href="/" className="text-sm font-medium text-emerald-600 underline">Kembali ke Dashboard</Link>
    </main>
  );
}
