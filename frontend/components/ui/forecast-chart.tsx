import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { day: "Hist 1-14", moisture: 65, temp: 28, maturity: 32 },
  { day: "Pred 1", moisture: 66, temp: 28.5, maturity: 35 },
  { day: "Pred 2", moisture: 67, temp: 29, maturity: 36 },
  { day: "Pred 3", moisture: 68, temp: 29, maturity: 36 },
  { day: "Pred 4", moisture: 69, temp: 29.5, maturity: 37 },
];

export default function ForecastChart() {
  return (
    <div className="w-full h-64 bg-[#18181b] rounded-xl border border-zinc-800 p-4 shadow-xl">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Prediksi 4 Hari (Maturity %)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis dataKey="day" tick={{ fill: "#a1a1aa", fontSize: 10 }} axisLine={{ stroke: "#52525b" }} />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} axisLine={{ stroke: "#52525b" }} />
          <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", color: "#fafafa" }} />
          <Line type="monotone" dataKey="maturity" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: "#fb923c" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
