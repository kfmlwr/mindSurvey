"use client";

import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

interface TagBadgeProps {
  label: string;
  color?: string | null;
  variant?: "default" | "outline" | "secondary" | "destructive";
  showColorDot?: boolean;
  className?: string;
}

const COLOR_CLASSES: Record<string, { bg: string; border: string; dot: string }> = {
  green: {
    bg: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    border: "border-green-300 dark:border-green-700",
    dot: "bg-green-500"
  },
  blue: {
    bg: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
    dot: "bg-blue-500"
  },
  teal: {
    bg: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    border: "border-teal-300 dark:border-teal-700",
    dot: "bg-teal-500"
  },
  indigo: {
    bg: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    border: "border-indigo-300 dark:border-indigo-700",
    dot: "bg-indigo-500"
  },
  purple: {
    bg: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    border: "border-purple-300 dark:border-purple-700",
    dot: "bg-purple-500"
  },
  pink: {
    bg: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    border: "border-pink-300 dark:border-pink-700",
    dot: "bg-pink-500"
  },
  slate: {
    bg: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
    border: "border-slate-300 dark:border-slate-700",
    dot: "bg-slate-500"
  },
  zinc: {
    bg: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
    border: "border-zinc-300 dark:border-zinc-700",
    dot: "bg-zinc-500"
  },
  yellow: {
    bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    border: "border-yellow-300 dark:border-yellow-700",
    dot: "bg-yellow-500"
  },
  red: {
    bg: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    border: "border-red-300 dark:border-red-700",
    dot: "bg-red-500"
  },
};

export function TagBadge({
  label,
  color,
  variant = "outline",
  showColorDot = false,
  className,
}: TagBadgeProps) {
  const colorClasses = color && COLOR_CLASSES[color];

  return (
    <Badge
      variant={variant}
      className={cn(
        colorClasses?.bg,
        variant === "outline" && colorClasses?.border,
        className
      )}
    >
      {showColorDot && color && (
        <div
          className={cn("mr-1 h-2 w-2 rounded-full", colorClasses?.dot)}
        />
      )}
      {label}
    </Badge>
  );
}