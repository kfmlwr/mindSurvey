"use client";

import React from "react";
import SurveyCard from "../_components/SurveyCard";
import { type RouterOutputs } from "~/trpc/react";
import { Progress } from "~/components/ui/progress";
import { useFormatter, useTranslations } from "next-intl";
import { AnimatePresence } from "motion/react";
import { useSurvey } from "./useSurvey";
import LocaleSwitch from "~/components/LanguageSwitch";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "~/i18n/navigation";

interface PageProps {
  adjectives: RouterOutputs["survey"]["getAdjectives"];
  inviteToken: string;
  surveyStatus: RouterOutputs["survey"]["getSurveyStatus"];
  isLeader: RouterOutputs["survey"]["isLeader"];
}

export default function SurveyPage({
  adjectives,
  inviteToken,
  surveyStatus,
  isLeader,
}: PageProps) {
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
  const router = useRouter();

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
      {currentIndex === 0 && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <LocaleSwitch />
          <ThemeToggle />
        </div>
      )}
      <div className="mx-auto w-full max-w-2xl">
        {isLeader.isLeader && surveyStatus.invite.status === "COMPLETED" && (
          <div className="mb-6">
            <Button
              variant={"ghost"}
              onClick={() => router.push(`/team/${surveyStatus.invite.teamId}`)}
            >
              <ArrowLeft />
              {t("backToTeam")}
            </Button>
          </div>
        )}

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
            isLeader={isLeader}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
