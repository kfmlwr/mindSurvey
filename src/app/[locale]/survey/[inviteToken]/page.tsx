import { api } from "~/trpc/server";
import { getLocale } from "next-intl/server";
import SurveyPage from "./SurveyPage";

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

  return <SurveyPage adjectives={adjectives} />;
}
