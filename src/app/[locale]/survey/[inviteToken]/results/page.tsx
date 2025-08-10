import { api } from "~/trpc/server";
import { ResultCard } from "../../_components/ResultCard";
import { PeerResultsCard } from "../../_components/PeerResultCard";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{ inviteToken: string }>;
}

export default async function Page({ params }: PageProps) {
  const { inviteToken } = await params;

  const surveyStatus = await api.survey.getSurveyStatus({
    inviteToken,
  });

  const t = await getTranslations("SurveyResult");

  // Check if survey is completed
  if (surveyStatus.invite.status !== "COMPLETED") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="mx-auto w-full max-w-2xl">
          <Alert variant="destructive">
            <AlertDescription>{t("pleaseCompleteSurvey")}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // If invite has a connected user (team leader), show results
  if (surveyStatus.invite.userId) {
    // Check if results are released for team average
    if (!surveyStatus.invite.resultsReleased) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="mx-auto w-full max-w-2xl">
            <Alert variant="destructive">
              <AlertDescription>{t("resultsNotReleased")}</AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    // Show results for user with connected account
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="mx-auto w-full max-w-2xl">
          {surveyStatus.result && (
            <ResultCard
              result={surveyStatus.result}
              teamAverage={surveyStatus.teamAverage}
              teamId={surveyStatus.invite.teamId}
            />
          )}
        </div>
      </div>
    );
  }

  // For invites without connected user - show peer results card
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="mx-auto w-full max-w-2xl">
        <PeerResultsCard />
      </div>
    </div>
  );
}
