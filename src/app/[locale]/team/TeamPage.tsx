"use client";

import { Button } from "~/components/ui/button";

import { ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { useTRPC, type RouterOutputs } from "~/trpc/react";
import { Link } from "~/i18n/navigation";
import { CreateTeamDialog } from "./_components/CreateTeamDialog";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

interface Props {
  teams: RouterOutputs["team"]["listTeams"];
}

export default function TeamPage({ teams }: Props) {
  const t = useTranslations("TeamOverviewPage");

  const trpc = useTRPC();

  const { data, refetch } = useQuery(
    trpc.team.listTeams.queryOptions(undefined, {
      initialData: teams,
      refetchOnWindowFocus: false,
    }),
  );

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mb-4">{t("description")}</p>
      </div>

      <div className="space-y-6 py-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <CreateTeamDialog callback={refetch} />
        </div>

        <div className="space-y-3">
          {data.map((team) => (
            <div
              key={team.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-purple-500 text-white">
                    {team.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{team.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {t("memberCount", { count: team._count.invitations })}
                  </div>
                </div>
              </div>
              <Link href={`/team/${team.id}`} passHref>
                <Button variant={"ghost"} size="sm">
                  <ArrowRight /> {t("viewTeam")}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
