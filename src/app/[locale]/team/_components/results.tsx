import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { ResultChart } from "../../survey/_components/ResultChart";
import { api } from "~/trpc/server";
import { getTranslations } from "next-intl/server";
import { Alert, AlertTitle } from "~/components/ui/alert";

interface Props {
  teamId: string;
}
export async function ResultsTab({ teamId }: Props) {
  const results = await api.team.getTeamResults({ teamId });
  const t = await getTranslations("TeamPage.resultsTab");

  return (
    <div className="space-y-6 pt-6">
      {/* Your team section */}

      <h2 className="mb-4 text-xl font-semibold">Your Results</h2>
      {results.isAllCompleted ? (
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>{t("allMembersCompleted")}</AlertTitle>
        </Alert>
      ) : (
        <Alert variant={"destructive"}>
          <AlertCircleIcon />
          <AlertTitle>{t("notAllMembersCompleted")}</AlertTitle>
        </Alert>
      )}

      {!results.resultsReleased ? (
        <Alert variant={"destructive"}>
          <AlertCircleIcon />
          <AlertTitle>{t("resultsNotReleased")}</AlertTitle>
        </Alert>
      ) : (
        (results.teamAverage || results.userResult) && (
          <ResultChart
            data={[
              ...(results.teamAverage
                ? [
                    {
                      ...results.teamAverage,
                      label: t("teamAverageLabel"),
                      color: "hsl(var(--primary))",
                    },
                  ]
                : []),
              ...(results.userResult
                ? [
                    {
                      ...results.userResult,
                      label: t("yourResultLabel"),
                      color: "hsl(var(--destructive))",
                    },
                  ]
                : []),
            ]}
          />
        )
      )}
    </div>
  );
}
