"use client";

import React from "react";

import { ResultChart } from "./ResultChart";
import { Card, CardContent } from "~/components/ui/card";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import MembersTab from "../../team/_components/team";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "~/i18n/navigation";

interface ResultCardProps {
  result: { x: number; y: number };
  teamId: string;
}

export function ResultCard({ result, teamId }: ResultCardProps) {
  const t = useTranslations("SurveyResult");

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-8"
    >
      <Card>
        <CardContent>
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-semibold">{t("title")}</h1>
              <p className="text-muted-foreground">{t("description")}</p>
            </div>
            <Link passHref href={`/team/${teamId}`}>
              <Button variant={"ghost"}>
                <ArrowRight />
                {t("toTeam")}
              </Button>
            </Link>
          </div>
          <ResultChart data={[result]} />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <MembersTab teamId={teamId} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
