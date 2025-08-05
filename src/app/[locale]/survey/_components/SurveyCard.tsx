"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { Response, Weight } from "@prisma/client";
import type { RouterOutputs } from "~/trpc/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

interface SurveyCardProps {
  adjective: RouterOutputs["survey"]["getAdjectives"][number];
  onAdjectiveSelect: (adjective: Response) => void;
  onFrequencySelect: (frequency: Weight) => void;
  selectedAdjective: Response | null;
  selectedFrequency: Weight | null;

  onNext?: () => void;
  onBack?: () => void;
  direction?: "next" | "back";
  isLeader: RouterOutputs["survey"]["isLeader"];
}

export default function SurveyCard({
  adjective,
  onAdjectiveSelect,
  onFrequencySelect,
  selectedAdjective,
  selectedFrequency,
  onNext,
  onBack,
  direction = "next",
  isLeader,
}: SurveyCardProps) {
  const t = useTranslations("SurveyCard");

  const frequencies = [
    { label: t("frequentAdjective"), value: Weight.HIGH },
    { label: t("infrequentAdjective"), value: Weight.LOW },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "next" ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction === "next" ? -50 : 50 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Card>
        <CardContent>
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-semibold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="mb-8 text-xl font-semibold">
              {isLeader.isLeader
                ? t("question")
                : t("peerQuestion", { name: isLeader.name })}
            </h2>

            {/* Adjective Selection */}
            <div className="mb-12 flex items-center justify-between">
              <Button
                variant={
                  selectedAdjective === Response.POSITIVE
                    ? "default"
                    : "outline"
                }
                className={`rounded-full border px-8 py-3`}
                onClick={() => onAdjectiveSelect?.(Response.POSITIVE)}
              >
                {adjective?.positive_adjective}
              </Button>

              <span className="text-muted-foreground text-sm">{t("or")}</span>
              <Button
                variant={
                  selectedAdjective === Response.NEGATIVE
                    ? "default"
                    : "outline"
                }
                className={`rounded-full border px-8 py-3`}
                onClick={() => onAdjectiveSelect?.(Response.NEGATIVE)}
              >
                {adjective?.negative_adjective}
              </Button>
            </div>

            {/* Frequency Selection */}
            <div className="grid grid-cols-2 gap-4">
              {frequencies.map((frequency) => (
                <Button
                  key={frequency.value}
                  variant={
                    selectedFrequency === frequency.value
                      ? "default"
                      : "outline"
                  }
                  className={cn("rounded-full")}
                  disabled={!selectedAdjective}
                  onClick={() =>
                    selectedAdjective && onFrequencySelect?.(frequency.value)
                  }
                >
                  {frequency.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("back")}
            </Button>

            <Button
              className="h-12 w-12 rounded-full"
              disabled={!selectedAdjective || !selectedFrequency}
              onClick={onNext}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
