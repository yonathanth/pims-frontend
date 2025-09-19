import React from "react";

interface SummaryCardProps {
  summaryData: {
    label: string;
    value: string | number | Record<string, any> | null;
    trend: "up" | "down";
  }[];
}


const SummaryCards: React.FC<SummaryCardProps> = ({ summaryData }) => {
  const normalizeSign = (p: string) => {
    // collapse odd sign combinations like "+-83.1%" -> "-83.1%"
    let s = p.trim();
    if (s.startsWith("+-") || s.startsWith("-+")) s = "-" + s.slice(2);
    if (s.startsWith("++")) s = "+" + s.slice(2);
    if (s.startsWith("--")) s = "-" + s.slice(2);
    return s;
  };

  const parseValue = (label: string, value: any): { displayLabel: string; main: string; percent?: string } => {
    let displayLabel = label;
    // If value is object and label indicates incomplete orders, show pending only
    if (value && typeof value === 'object') {
      if (/incomplete\s*orders\s*breakdown/i.test(label)) {
        displayLabel = 'Pending Orders';
        const pending = typeof value.pending === 'number' ? value.pending : Number(value.pending ?? 0) || 0;
        return { displayLabel, main: String(pending) };
      }
      // For other objects, show a compact count of keys
      return { displayLabel, main: JSON.stringify(value) };
    }
    let str = String(value ?? '');
    // Handle when backend sends JSON string for breakdown
    if (/^\s*\{/.test(str) && /\}\s*$/.test(str)) {
      try {
        const parsed = JSON.parse(str);
        if (/incomplete\s*orders\s*breakdown/i.test(label)) {
          displayLabel = 'Pending Orders';
          const pending = typeof parsed.pending === 'number' ? parsed.pending : Number(parsed.pending ?? 0) || 0;
          return { displayLabel, main: String(pending) };
        }
        // fallback display stringified if object isn't the breakdown we expect
        return { displayLabel, main: JSON.stringify(parsed) };
      } catch {}
    }
    // Extract a trailing percent in parentheses: e.g., "1234 (+8.4%)"
    const m = str.match(/^(.*?)(?:\s*\(([+\-]*\d+(?:\.\d+)?%)\)\s*)$/);
    if (m && m[2]) {
      return { displayLabel, main: m[1].trim(), percent: normalizeSign(m[2]) };
    }
    return { displayLabel, main: str };
  };

  return (
    <div className="py-3 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {summaryData.map(({ label, value, trend }, index) => {
        const { displayLabel, main, percent } = parseValue(label, value);
        return (
          <div
            key={index}
            className="border p-4 bg-[#f4f4f4] flex flex-col gap-2"
          >
            <span className="text-sm text-gray-600">{displayLabel}</span>
            <div className="flex items-center justify-between">
              <strong className="text-lg">
                {main}
                {percent ? (
                  <sub className="ml-1 text-xs text-gray-500 align-sub">{percent}</sub>
                ) : null}
              </strong>
              <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
                {trend === "up" ? "↑" : "↓"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;