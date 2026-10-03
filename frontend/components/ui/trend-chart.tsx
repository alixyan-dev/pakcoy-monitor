"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Point {
  day: number;
  moisture_avg: number;
  temperature_avg: number;
}

export default function TrendChart({ data }: { data: Point[] }) {
  const chartData = (data || []).slice(-30).map((d) => ({
    day: d.day,
    "Kelembaban %": d.moisture_avg || 0,
    "Suhu °C": d.temperature_avg || 0,
  }));

  return (
    <div className="w-full h-48 bg-[#18181b] rounded-xl border border-zinc-800 p-4 shadow-xl shadow-black/20">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">Tren 30 Hari</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis dataKey="day" tick={{ fill: "#a1a1aa", fontSize: 10 }} axisLine={{ stroke: "#52525b" }} />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} axisLine={{ stroke: "#52525b" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", color: "#fafafa", borderRadius: 8 }}
            labelStyle={{ color: "#fb923c" }}
          />
          <Line type="monotone" dataKey="Kelembaban %" stroke="#f97316" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Suhu °C" stroke="#fbbf24" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
