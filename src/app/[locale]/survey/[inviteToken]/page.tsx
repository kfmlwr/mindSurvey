import { api } from "~/trpc/server";
import { getLocale } from "next-intl/server";
import SurveyPage from "./SurveyPage";
import { redirect } from "~/i18n/navigation";

interface PageProps {
  params: Promise<{ inviteToken: string }>;
}

export default async function Page({ params }: PageProps) {
  const { inviteToken } = await params;
  const locale = await getLocale();

  const adjectives = await api.survey.getAdjectives({
    locale,
    inviteToken,
  });

  const surveyStatus = await api.survey.getSurveyStatus({
    inviteToken,
  });

  const isLeader = await api.survey.isLeader({ inviteToken });

  if (surveyStatus.invite.status === "COMPLETED") {
    redirect({ href: `/survey/${inviteToken}/results`, locale });
  }

  return (
    <SurveyPage
      adjectives={adjectives}
      inviteToken={inviteToken}
      surveyStatus={surveyStatus}
      isLeader={isLeader}
    />
  );
}
