/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  CartesianGrid,
  Customized,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

interface Point {
  x: number;
  y: number;
}

// Beispiel-Daten
const data: Point[] = [{ x: 0.5, y: 0.8 }];

const chartConfig = {
  points: {
    label: "Punkte",
  },
};

function QuadrantLabels({ width, height }: { width: number; height: number }) {
  return (
    <>
      <text
        x={width * 0.25}
        y={height * 0.25}
        textAnchor="middle"
        fontSize={12}
        fill="#888"
      >
        2. Quadrant
      </text>
      <text
        x={width * 0.75}
        y={height * 0.25}
        textAnchor="middle"
        fontSize={12}
        fill="#888"
      >
        1. Quadrant
      </text>
      <text
        x={width * 0.25}
        y={height * 0.75}
        textAnchor="middle"
        fontSize={12}
        fill="#888"
      >
        3. Quadrant
      </text>
      <text
        x={width * 0.75}
        y={height * 0.75}
        textAnchor="middle"
        fontSize={12}
        fill="#888"
      >
        4. Quadrant
      </text>
    </>
  );
}

export function ResultCard() {
  return (
    <ChartContainer config={chartConfig} className="h-[400px]">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        {/* Gitterlinien */}
        <CartesianGrid strokeDasharray="3 3" />
        {/* X‑Achse von –1 bis +1 */}
        <XAxis
          type="number"
          dataKey="x"
          domain={[-1, 1]}
          tick={false}
          axisLine={false}
        />
        {/* Y‑Achse von –1 bis +1 */}
        <YAxis
          type="number"
          dataKey="y"
          domain={[-1, 1]}
          tick={false}
          axisLine={false}
        />
        {/* Null-Linien als Achsen-Visualisierung */}
        <ReferenceLine x={0} stroke="#000" />
        <ReferenceLine y={0} stroke="#000" />
        {/* Tooltip bei Hover */}
        <ChartTooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={<ChartTooltipContent />}
        />

        <Customized component={QuadrantLabels as any} />
        {/* Punkte */}
        <Scatter name="points" data={data} fill="var(--color-chart-1)" />
      </ScatterChart>
    </ChartContainer>
  );
}
