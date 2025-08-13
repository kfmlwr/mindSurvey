"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { TeamResults } from "~/components/shared/TeamResults";
import { useTranslations } from "next-intl";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";

interface Props {
  teamId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminTeamResultsDialog({
  teamId,
  open,
  onOpenChange,
}: Props) {
  const t = useTranslations("Admin");
  const tTeam = useTranslations("TeamPage.resultsTab");
  const trpc = useTRPC();

  const { data: teamDetails } = useQuery(
    trpc.admin.getTeamDetails.queryOptions(
      { teamId: teamId! },
      { enabled: !!teamId },
    ),
  );

  const { data: results, isLoading } = useQuery(
    trpc.admin.getTeamResults.queryOptions(
      { teamId: teamId! },
      { enabled: !!teamId },
    ),
  );

  if (!teamId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {t("viewTeamResults", { teamName: teamDetails?.name || "" })}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div>Loading results...</div>
            </div>
          ) : results ? (
            <TeamResults
              data={results}
              translations={{
                allMembersCompleted: tTeam("allMembersCompleted"),
                notAllMembersCompleted: tTeam("notAllMembersCompleted"),
                resultsNotReleased: tTeam("resultsNotReleased"),
                teamAverageLabel: tTeam("teamAverageLabel"),
                userResultLabel: tTeam("yourResultLabel"),
              }}
              showUserResult={false}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
