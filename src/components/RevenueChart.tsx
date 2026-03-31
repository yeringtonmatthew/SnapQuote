'use client';

import { useState, useRef, useEffect } from 'react';

type RevenueData = { month: string; revenue: number };

export default function RevenueChart({ data }: { data: RevenueData[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [tooltip, setTooltip] = useState<{ index: number; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-gray-400 dark:text-gray-500">
        No revenue data yet
      </div>
    );
  }

  const height = 200;
  const paddingTop = 28;
  const paddingBottom = 24;
  const paddingX = 8;
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingX * 2;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  // Round up to a nice number for the y-axis
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxRevenue)));
  const yMax = Math.ceil(maxRevenue / magnitude) * magnitude || 1;

  const barCount = data.length;
  const gap = Math.max(6, chartWidth * 0.04);
  const barWidth = Math.max(16, (chartWidth - gap * (barCount + 1)) / barCount);
  const totalBarsWidth = barWidth * barCount + gap * (barCount + 1);
  const offsetX = paddingX + (chartWidth - totalBarsWidth) / 2 + gap;

  // Determine current month label
  const now = new Date();
  const currentMonthLabel = now.toLocaleString('en-US', { month: 'short' });

  const formatDollar = (n: number) =>
    '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleBarInteraction = (index: number, barX: number, barY: number) => {
    setTooltip((prev) =>
      prev?.index === index ? null : { index, x: barX + barWidth / 2, y: barY - 8 }
    );
  };

  return (
    <div ref={containerRef} className="w-full relative" style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          className="select-none"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Y-axis gridlines */}
          {[0, 0.5, 1].map((frac) => {
            const y = paddingTop + chartHeight * (1 - frac);
            return (
              <line
                key={frac}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
                className="stroke-gray-100 dark:stroke-gray-800"
                strokeWidth={1}
              />
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const barHeight = (d.revenue / yMax) * chartHeight;
            const x = offsetX + i * (barWidth + gap);
            const y = paddingTop + chartHeight - barHeight;
            const isCurrent = d.month === currentMonthLabel;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onClick={() => handleBarInteraction(i, x, y)}
                onMouseEnter={() =>
                  setTooltip({ index: i, x: x + barWidth / 2, y: y - 8 })
                }
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleBarInteraction(i, x, y);
                }}
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx={4}
                  fill={isCurrent ? '#4338ca' : '#4f46e5'}
                  opacity={isCurrent ? 1 : 0.75}
                  className="transition-opacity hover:opacity-100"
                />

                {/* Dollar amount above bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-gray-500 dark:fill-gray-400"
                  fontSize={10}
                  fontWeight={600}
                >
                  {d.revenue >= 1000
                    ? '$' + (d.revenue / 1000).toFixed(d.revenue % 1000 === 0 ? 0 : 1) + 'k'
                    : formatDollar(d.revenue)}
                </text>

                {/* Month label */}
                <text
                  x={x + barWidth / 2}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-gray-400 dark:fill-gray-500"
                  fontSize={11}
                  fontWeight={isCurrent ? 700 : 500}
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Tooltip */}
      {tooltip !== null && data[tooltip.index] && (
        <div
          className="absolute pointer-events-none z-10 rounded-lg bg-gray-900 dark:bg-gray-700 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg transition-all"
          style={{
            left: Math.min(Math.max(tooltip.x, 40), width - 40),
            top: Math.max(tooltip.y - 32, 0),
            transform: 'translateX(-50%)',
          }}
        >
          {formatDollar(data[tooltip.index].revenue)}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"
          />
        </div>
      )}
    </div>
  );
}
