"use client";

import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { ResultChart } from "~/app/[locale]/survey/_components/ResultChart";
import type { Point } from "~/app/[locale]/survey/_components/ResultChart";

interface TeamResultsData {
  isAllCompleted: boolean;
  teamAverage: { x: number; y: number } | null;
  userResult: { x: number; y: number } | null;
  resultsReleased: Date | null;
}

interface Props {
  data: TeamResultsData;
  translations: {
    allMembersCompleted: string;
    notAllMembersCompleted: string;
    resultsNotReleased: string;
    teamAverageLabel: string;
    userResultLabel: string;
  };
  showUserResult?: boolean;
}

export function TeamResults({
  data,
  translations,
  showUserResult = true,
}: Props) {
  const chartData: Point[] = [];

  console.log("TeamResults data:", data);

  // Add team average if available
  if (data.teamAverage) {
    chartData.push({
      ...data.teamAverage,
      label: translations.teamAverageLabel,
      color: "hsl(var(--primary))",
    });
  }

  // Add user result if available and should be shown
  if (showUserResult && data.userResult) {
    chartData.push({
      ...data.userResult,
      label: translations.userResultLabel,
      color: "hsl(var(--destructive))",
    });
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Completion status */}
      {data.isAllCompleted ? (
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>{translations.allMembersCompleted}</AlertTitle>
        </Alert>
      ) : (
        <Alert variant={"destructive"}>
          <AlertCircleIcon />
          <AlertTitle>{translations.notAllMembersCompleted}</AlertTitle>
        </Alert>
      )}

      {/* Results display */}
      {!data.resultsReleased ? (
        <Alert variant={"destructive"}>
          <AlertCircleIcon />
          <AlertTitle>{translations.resultsNotReleased}</AlertTitle>
        </Alert>
      ) : (
        chartData.length > 0 && (
          <div className="min-h-0 flex-1">
            <ResultChart data={chartData} />
          </div>
        )
      )}
    </div>
  );
}
