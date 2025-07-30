"use client";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
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

export interface Point {
  x: number;
  y: number;
}

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
        fill="var(--muted-foreground)"
      >
        2. Quadrant
      </text>
      <text
        x={width * 0.75}
        y={height * 0.25}
        textAnchor="middle"
        fontSize={12}
        fill="var(--muted-foreground)"
      >
        1. Quadrant
      </text>
      <text
        x={width * 0.25}
        y={height * 0.75}
        textAnchor="middle"
        fontSize={12}
        fill="var(--muted-foreground)"
      >
        3. Quadrant
      </text>
      <text
        x={width * 0.75}
        y={height * 0.75}
        textAnchor="middle"
        fontSize={12}
        fill="var(--muted-foreground)"
      >
        4. Quadrant
      </text>
    </>
  );
}

interface ResultChartProps {
  data?: Point[];
}

export function ResultChart({ data }: ResultChartProps) {
  return (
    <ChartContainer config={chartConfig} className="m-0 size-full p-0">
      <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: -58 }}>
        {/* Gitterlinien */}
        {/* <CartesianGrid strokeDasharray="3 3" className="w-full" /> */}
        {/* X‑Achse von –5 bis +5 */}
        <XAxis
          type="number"
          dataKey="x"
          domain={[-5, 5]}
          tick={false}
          axisLine={false}
        />
        {/* Y‑Achse von –5 bis +5 */}
        <YAxis
          type="number"
          dataKey="y"
          domain={[-5, 5]}
          tick={false}
          axisLine={false}
        />
        {/* Null-Linien als Achsen-Visualisierung */}
        <ReferenceLine x={0} stroke="var(--foreground)" />
        <ReferenceLine y={0} stroke="var(--foreground)" />
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
