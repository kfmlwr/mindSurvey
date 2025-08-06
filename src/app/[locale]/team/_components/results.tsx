import { AlertCircleIcon, ArrowRight, CheckCircle2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { ResultChart } from "../../survey/_components/ResultChart";
import { api } from "~/trpc/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { Alert, AlertTitle } from "~/components/ui/alert";

interface Props {
  teamId: string;
}
export async function ResultsTab({ teamId }: Props) {
  const results = await api.team.getTeamResults({ teamId });
  const invites = await api.team.getTeamMemberResults({ teamId });

  const formatter = await getFormatter();

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

      {results.results && <ResultChart data={[results.results]} />}

      <div className="space-y-3">
        {invites.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-purple-500 text-white">
                  {member.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{member.email}</div>
                <div className="text-muted-foreground text-sm">
                  {member.completedAt &&
                    t("completedAt", {
                      completedAt: member.completedAt
                        ? formatter.dateTime(member.completedAt)
                        : "N/A",
                    })}
                </div>
              </div>
            </div>
            <Link
              href={`/survey/${member.inviteToken}`}
              passHref
              target="_blank"
            >
              <Button variant="default" size="sm">
                {t("resultButton")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
