import React from "react";

interface SummaryCardProps {
  summaryData: {
    label: string;
    value: string | number | Record<string, unknown> | null;
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

  const isIncompleteOrdersLabel = (label: string) => /incomplete\s*orders\s*breakdown/i.test(label);

  // type IncompleteOrders removed (was unused)
  const extractPending = (obj: Record<string, unknown>): number => {
    let raw: number | string | null | undefined;
    if ("pending" in obj) {
      raw = obj["pending"] as number | string | null | undefined;
    } else {
      raw = undefined;
    }
    const n = typeof raw === 'number' ? raw : Number(raw ?? 0);
    return Number.isFinite(n) ? n : 0;
  };

  const parseValue = (
    label: string,
    value: string | number | Record<string, any> | null
  ): { displayLabel: string; main: string; subscript?: string } => {
    let displayLabel = label;
    // If value is object and label indicates incomplete orders, show pending only
    if (value && typeof value === 'object') {
      if (isIncompleteOrdersLabel(label)) {
        displayLabel = 'Pending Orders';
        return { displayLabel, main: String(extractPending(value as Record<string, unknown>)) };
      }
      // For other objects, show a compact count of keys
      return { displayLabel, main: `${Object.keys(value).length} key${Object.keys(value).length !== 1 ? 's' : ''}` };
    }
    let str = String(value ?? '');
    // Handle when backend sends JSON string for breakdown
    if (/^\s*\{/.test(str) && /\}\s*$/.test(str)) {
      try {
        const parsed = JSON.parse(str);
        if (isIncompleteOrdersLabel(label)) {
          displayLabel = 'Pending Orders';
          return { displayLabel, main: String(extractPending(parsed)) };
        }
        // fallback display stringified if object isn't the breakdown we expect
        return { displayLabel, main: JSON.stringify(parsed) };
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error("Failed to parse JSON in SummaryCards.parseValue:", err);
        }
      }
    }

    // Special handling for subscript for certain cards
    const subscriptCards = [
      'Most Sold Item',
      'Most Ordered Product',
      'Top Performer',
    ];
    // For sales/transaction per desk/staff, show only the number (no subscript/percent)
    const numberOnlyCards = [
      'Sales Per Desk',
      'Transaction Per Desk',
      'Sales Per Staff',
      'Transaction Per Staff',
    ];

    // If numberOnlyCards, strip everything except the number
    if (numberOnlyCards.includes(label)) {
      // Extract first number (int or float)
      const numMatch = str.match(/([\d,.]+)/);
      return { displayLabel, main: numMatch ? numMatch[1] : str };
    }

    // If subscriptCards, extract number in brackets and show as subscript
    if (subscriptCards.includes(label)) {
      // e.g. "Paracetamol [123]" or "Paracetamol (123)"
      const match = str.match(/^(.*?)[\[(]([\d,.]+)[\])]$/);
      if (match) {
        return { displayLabel, main: match[1].trim(), subscript: match[2] };
      }
    }

    // Default: Extract a trailing percent in parentheses: e.g., "1234 (+8.4%)"
    const m = str.match(/^(.*?)(?:\s*\(([+\-]*\d+(?:\.\d+)?%)\)\s*)$/);
    if (m && m[2]) {
      return { displayLabel, main: m[1].trim(), subscript: normalizeSign(m[2]) };
    }
    return { displayLabel, main: str };
  };

  // Only render the first 10 cards (2 rows of 5)
  const visibleCards = summaryData.slice(0, 10);
  return (
    <div className="py-3 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {visibleCards.map(({ label, value, trend }, index) => {
        const { displayLabel, main, subscript } = parseValue(label, value);
        return (
          <div
            key={index}
            className="border p-4 bg-[#f4f4f4] flex flex-col gap-2"
          >
            <span className="text-sm text-gray-600">{displayLabel}</span>
            <div className="flex items-center justify-between">
              <strong className="text-lg">
                {main}
                {subscript ? (
                  <sub className="ml-1 text-xs text-gray-500 align-sub">{subscript}</sub>
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