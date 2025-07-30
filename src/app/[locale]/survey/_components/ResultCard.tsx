import React from "react";

import { ResultChart } from "./ResultChart";
import { Card, CardContent } from "~/components/ui/card";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";

interface ResultCardProps {
  result: { x: number; y: number };
}

export function ResultCard({ result }: ResultCardProps) {
  const t = useTranslations("SurveyResult");

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Card>
        <CardContent>
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-semibold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <ResultChart data={[result]} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
