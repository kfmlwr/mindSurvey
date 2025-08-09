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
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

export interface Point {
  x: number;
  y: number;
  label?: string;
  color?: string;
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

function PointLabels({ data }: { data?: Point[] }) {
  if (!data) return null;
  
  return (
    <>
      {data.map((point, index) => {
        if (!point.label) return null;
        
        // Convert domain values (-5 to 5) to chart coordinates
        // Assuming chart width/height are available in the parent context
        const xPercent = ((point.x + 5) / 10) * 100;
        const yPercent = ((5 - point.y) / 10) * 100; // Inverted because SVG y grows downward
        
        return (
          <text
            key={index}
            x={`${xPercent}%`}
            y={`${yPercent}%`}
            dx={10}
            dy={-10}
            fontSize={12}
            fontWeight="bold"
            fill={point.color || "var(--foreground)"}
            textAnchor="start"
          >
            {point.label}
          </text>
        );
      })}
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
        <Customized component={() => <PointLabels data={data} />} />
        {/* Team Average Points */}
        <Scatter 
          name="team"
          data={data?.filter(point => point.color === "hsl(var(--primary))")?.map(point => ({ x: point.x, y: point.y }))} 
          fill="hsl(var(--primary))" 
        />
        {/* User Points */}
        <Scatter 
          name="user"
          data={data?.filter(point => point.color === "hsl(var(--destructive))")?.map(point => ({ x: point.x, y: point.y }))} 
          fill="hsl(var(--destructive))" 
        />
        {/* Default Points */}
        <Scatter 
          name="points" 
          data={data?.filter(point => !point.color)?.map(point => ({ x: point.x, y: point.y }))} 
          fill="var(--color-chart-1)" 
        />
      </ScatterChart>
    </ChartContainer>
  );
}
