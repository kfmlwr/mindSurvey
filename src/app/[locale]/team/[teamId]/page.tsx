import { Button } from "~/components/ui/button";

import { ResultsTab } from "../_components/results";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { api } from "~/trpc/server";
import { Link } from "~/i18n/navigation";

interface PageProps {
  params: Promise<{ teamId: string }>;
}

export default async function TeamHome({ params }: PageProps) {
  const { teamId } = await params;
  const t = await getTranslations("TeamPage");
  const members = await api.team.listAllInvites({ teamId });
  const leaderInvite = await api.invite.getLeaderInvite({ teamId });

  return (
    <div className="md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mb-4">{t("description")}</p>
          {leaderInvite.status === "PENDING" && (
            <Link href={`/survey/${leaderInvite.inviteToken}`} passHref>
              <Button>
                {t("completeSurvey")} <ArrowRight />
              </Button>
            </Link>
          )}
        </div>
        {/* Tabs */}
        <div className="mb-6">
          <ResultsTab teamId={teamId} />
          {/* <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
              <TabsTrigger value="team">{t("team")}</TabsTrigger>
              <TabsTrigger value="results">{t("results")}</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <OverviewTab teamId={teamId} />
            </TabsContent>
            <TabsContent value="team">
              <MembersTab
                members={members}
                teamId={teamId}
                leaderInvite={leaderInvite}
              />
            </TabsContent>
            <TabsContent value="results">
              <ResultsTab teamId={teamId} />
            </TabsContent>
          </Tabs> */}
        </div>
      </div>
    </div>
  );
}
