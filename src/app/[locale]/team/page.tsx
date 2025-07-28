import { Button } from "~/components/ui/button";

import { OverviewTab } from "./_components/overview";
import { MembersTab } from "./_components/team";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ResultsTab } from "./_components/results";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

export default function TeamHome() {
  const t = useTranslations("TeamPage");

  return (
    <div className="min-h-screen md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mb-4">{t("description")}</p>
          <Button>
            {t("completeSurvey")} <ArrowRight />
          </Button>
        </div>
        {/* Tabs */}
        <div className="mb-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
              <TabsTrigger value="team">{t("team")}</TabsTrigger>
              <TabsTrigger value="results">{t("results")}</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="team">
              <MembersTab />
            </TabsContent>
            <TabsContent value="results">
              <ResultsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
