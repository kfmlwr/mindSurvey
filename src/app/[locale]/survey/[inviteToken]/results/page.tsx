import { api } from "~/trpc/server";
import { ResultCard } from "../../_components/ResultCard";
import { PeerResultsCard } from "../../_components/PeerResultCard";

interface PageProps {
  params: Promise<{ inviteToken: string }>;
}

export default async function Page({ params }: PageProps) {
  const { inviteToken } = await params;

  const surveyStatus = await api.survey.getSurveyStatus({
    inviteToken,
  });

  const isLeader = await api.survey.isLeader({ inviteToken });

  if (!surveyStatus.result) {
    return null;
  }

  if (isLeader.isLeader && surveyStatus.invite.status === "COMPLETED") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="mx-auto w-full max-w-2xl">
          <ResultCard
            result={surveyStatus.result}
            teamId={surveyStatus.invite.teamId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="mx-auto w-full max-w-2xl">
        <PeerResultsCard />
      </div>
    </div>
  );
}
