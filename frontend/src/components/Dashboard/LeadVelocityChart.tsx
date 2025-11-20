import { useMemo } from "react";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const LeadVelocityChart = () => {
  const chartData = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return {
      labels,
      datasets: [
        {
          label: "Leads Captured",
          data: labels.map(() => Math.floor(Math.random() * 120) + 20),
          backgroundColor: "rgba(0,245,212,0.5)",
          borderRadius: 12,
        },
        {
          label: "Meetings Booked",
          data: labels.map(() => Math.floor(Math.random() * 40) + 10),
          backgroundColor: "rgba(192,0,255,0.35)",
          borderRadius: 12,
        },
      ],
    };
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#cbd5f5",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(148,163,184,0.1)" },
      },
      y: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(148,163,184,0.1)" },
      },
    },
  };

  return (
    <div className="glass-panel rounded-3xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white">Lead Velocity</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default LeadVelocityChart;


