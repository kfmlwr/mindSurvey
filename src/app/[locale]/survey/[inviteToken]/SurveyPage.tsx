"use client";

import React from "react";
import SurveyCard from "../_components/SurveyCard";
import { useTRPC, type RouterOutputs } from "~/trpc/react";
import { type Response, type Weight } from "@prisma/client";
import { Progress } from "~/components/ui/progress";
import { useFormatter, useTranslations } from "next-intl";
import { AnimatePresence } from "motion/react";
import type { Router } from "next/router";
import { useSurvey } from "./useSurvey";

interface PageProps {
  adjectives: RouterOutputs["survey"]["getAdjectives"];
  inviteToken: string;
}

type Pair = RouterOutputs["survey"]["getAdjectives"][number];

export default function SurveyPage({ adjectives, inviteToken }: PageProps) {
  const {
    current,
    direction,
    currentIndex,
    processPercentage,
    updateCurrent,
    next,
    back,
  } = useSurvey(adjectives, inviteToken);

  const format = useFormatter();
  const t = useTranslations("SurveyCard");

  const percentageString = format.number(processPercentage, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (!current?.adjective) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-muted-foreground text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8">
          <Progress value={processPercentage * 100} />
          <p className="text-muted-foreground text-sm">
            {t("progress", { percentage: percentageString })}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <SurveyCard
            key={currentIndex}
            adjective={current.adjective}
            selectedAdjective={current.response}
            selectedFrequency={current.frequency}
            onAdjectiveSelect={(res) => updateCurrent(res, current.frequency)}
            onFrequencySelect={(freq) => updateCurrent(current.response, freq)}
            onNext={next}
            onBack={back}
            direction={direction}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
