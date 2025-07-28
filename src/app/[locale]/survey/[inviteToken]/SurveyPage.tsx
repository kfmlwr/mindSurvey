"use client";

import React from "react";
import SurveyCard from "../_components/SurveyCard";
import type { RouterOutputs } from "~/trpc/react";
import { type Response, type Weight } from "@prisma/client";
import { Progress } from "~/components/ui/progress";
import { useFormatter, useTranslations } from "next-intl";
import { AnimatePresence } from "motion/react";

interface PageProps {
  adjectives: RouterOutputs["survey"]["getAdjectives"];
}

export default function SurveyPage({ adjectives }: PageProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [currentResponse, setCurrentResponse] = React.useState<Response | null>(
    null,
  );
  const [currentFrequency, setCurrentFrequency] = React.useState<Weight | null>(
    null,
  );

  const [processPercentage, setProcessPercentage] = React.useState(0);
  const [direction, setDirection] = React.useState<"next" | "back">("next");

  const format = useFormatter();
  const totalAdjectives = adjectives.length;

  const currentAdjective = adjectives[currentIndex];

  const t = useTranslations("SurveyCard");

  const handleNext = () => {
    if (currentIndex < totalAdjectives - 1) {
      setDirection("next");
      setCurrentIndex((prev) => prev + 1);
      setProcessPercentage((currentIndex + 1) / totalAdjectives);
      setCurrentResponse(null);
      setCurrentFrequency(null);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setDirection("back");
      setCurrentIndex((prev) => prev - 1);
      setProcessPercentage((currentIndex - 1) / totalAdjectives);
      setCurrentResponse(null);
      setCurrentFrequency(null);
    }
  };

  const percentageString = format.number(processPercentage, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (!currentAdjective) {
    return <div>No more adjectives to survey.</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={processPercentage * 100} />
          <p className="text-muted-foreground text-sm">
            {t("progress", { percentage: percentageString })}
          </p>
        </div>
        <AnimatePresence mode="wait">
          <SurveyCard
            key={currentIndex}
            adjective={currentAdjective}
            onAdjectiveSelect={setCurrentResponse}
            onFrequencySelect={setCurrentFrequency}
            selectedAdjective={currentResponse}
            selectedFrequency={currentFrequency}
            onNext={handleNext}
            onBack={handleBack}
            direction={direction}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
