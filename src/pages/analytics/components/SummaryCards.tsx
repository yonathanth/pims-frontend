import React from "react";

interface SummaryCardProps {
  summaryData: {
    label: string;
    value: string;
    trend: "up" | "down";
  }[];
}


const SummaryCards: React.FC<SummaryCardProps> = ({ summaryData }) => {
  return (
    <div className="py-3 grid  gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", display: "grid" }}>
      {summaryData.map(({ label, value, trend }, index) => (
        <div
          key={index}
          className="border p-4 bg-[#f4f4f4] flex flex-col gap-2"
        >
          <span className="text-sm text-gray-600">{label}</span>
          <div className="flex items-center justify-between">
            <strong className="text-lg">{value}</strong>
            <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
              {trend === "up" ? "↑" : "↓"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;