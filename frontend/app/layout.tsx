import React from "react";
import "./globals.css";
import SidebarNav from "@/components/ui/sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <title>Pakcoy Monitor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-[#09090b] text-zinc-50 font-sans antialiased selection:bg-orange-500/30 selection:text-orange-100">
        <SidebarNav />
        <main className="ml-16 lg:ml-64 transition-all duration-300 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
