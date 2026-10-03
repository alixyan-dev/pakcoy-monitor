"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Leaf, Activity, Clock, MessageSquareQuote, BookOpen } from "lucide-react";

export default function SidebarNav() {
  const [open, setOpen] = useState(true);
  const nav = [
    { href: "/", label: "Dashboard", icon: Leaf },
    { href: "/prediction", label: "Prediksi", icon: Activity },
    { href: "/history", label: "Sejarah", icon: Clock },
    { href: "/assistant", label: "Asisten", icon: MessageSquareQuote },
    { href: "/about", label: "Tentang", icon: BookOpen },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-screen z-40 bg-zinc-950 border-r border-orange-500/10 flex flex-col transition-all duration-300 ${open ? "w-64" : "w-16"}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-orange-500/10">
        <Link href="/" className={`font-semibold text-orange-400 tracking-tight ${open ? "block" : "hidden"}`}>Pakcoy</Link>
        <button onClick={() => setOpen(!open)} className="text-zinc-400 hover:text-orange-400 transition-colors" aria-label="Toggle sidebar">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:text-orange-400 hover:bg-orange-950/20 transition-colors rounded-lg mx-2">
              <Icon size={20} />
              <span className={`${open ? "block" : "hidden"}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={`p-4 text-xs text-zinc-500 ${open ? "block" : "hidden"}`}>
        Multimodal CNN-LSTM
      </div>
    </aside>
  );
}
