"use client";

import {
  Loader2,
  Mail,
  MoreHorizontal,
  Trash2,
  Info,
  CheckCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Alert, AlertDescription } from "~/components/ui/alert";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { useTRPC, type RouterOutputs } from "~/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface Props {
  members?: RouterOutputs["team"]["listAllInvites"];
  leaderInvite?: RouterOutputs["invite"]["getLeaderInvite"];
  teamId: string;
}

export default function MembersTab({ members, teamId, leaderInvite }: Props) {
  const t = useTranslations("TeamPage.teamTab");

  const trpc = useTRPC();

  const [inviteEmail, setInviteEmail] = React.useState("");

  const { data, refetch } = useQuery(
    trpc.team.listAllInvites.queryOptions(
      { teamId },
      {
        initialData: members,
        refetchOnWindowFocus: false,
      },
    ),
  );

  const memberCount = data?.length || 0;

  const inviteMutation = useMutation(
    trpc.team.inviteMember.mutationOptions({
      onSuccess: () => {
        void refetch();
        setInviteEmail("");
      },
      onError: (error) => {
        console.error("Error inviting member:", error);
      },
    }),
  );

  const handleInvite = () => {
    const promise = inviteMutation.mutateAsync({
      email: inviteEmail,
      teamId,
    });

    toast.promise(promise, {
      loading: t("invitingMember"),
      success: t("memberInvited"),
      error: t("errorInvitingMember"),
    });
  };

  const removeInviteMutation = useMutation(
    trpc.team.removeInvite.mutationOptions({
      onSuccess: () => {
        void refetch();
      },
      onError: (error) => {
        console.error("Error removing member:", error);
      },
    }),
  );

  const handleRemoveInvite = (inviteId: string) => {
    const promise = removeInviteMutation.mutateAsync({
      inviteId,
    });

    toast.promise(promise, {
      loading: t("removingMember"),
      success: t("memberRemoved"),
      error: t("errorRemovingMember"),
    });
  };

  const resendInviteMutation = useMutation(
    trpc.team.resendInvite.mutationOptions({
      onSuccess: () => {
        void refetch();
      },
      onError: (error) => {
        console.error("Error resending invite:", error);
      },
    }),
  );

  const handleResendInvite = (inviteId: string) => {
    const promise = resendInviteMutation.mutateAsync({
      inviteId,
    });

    toast.promise(promise, {
      loading: t("resendingInvite"),
      success: t("resendInviteSuccess"),
      error: t("resendInviteError"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Add members section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">{t("title")}</h2>

        {/* Exact members requirement info */}
        {memberCount !== 5 && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {memberCount === 0
                ? t("exactMembersRequired")
                : memberCount < 5
                  ? t("addMoreMembers", { 
                      count: 5 - memberCount,
                      plural: 5 - memberCount === 1 ? "" : "s"
                    })
                  : t("tooManyMembers", { 
                      count: memberCount - 5,
                      plural: memberCount - 5 === 1 ? "" : "s"
                    })}
              <br />
              <span className="text-muted-foreground text-xs">
                {t("currentMembersCount", { current: memberCount })}
              </span>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="E-Mail"
            className="w-full"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Button
            onClick={() => handleInvite()}
            disabled={inviteMutation.isPending || memberCount >= 5}
          >
            {inviteMutation.isPending && (
              <Loader2 className="mr-2 animate-spin" />
            )}
            {t("invite")}
          </Button>
        </div>

        {memberCount === 5 && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {t("exactMembersReached")}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Your team section */}
      <div>
        {((Array.isArray(data) && data.length > 0) || leaderInvite) && (
          <h2 className="mb-4 text-xl font-semibold">{t("yourTeam")}</h2>
        )}
        <div className="space-y-3">
          {/* Leader Invite (disabled, greyed out) */}
          {leaderInvite && (
            <div
              key={leaderInvite.id}
              className="pointer-events-none flex items-center justify-between py-2 opacity-50"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-purple-500 text-white">
                    {leaderInvite.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{leaderInvite.email}</div>
                  <div className="text-muted-foreground text-sm">
                    {leaderInvite.status.charAt(0).toUpperCase() +
                      leaderInvite.status.slice(1).toLowerCase()}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Other members */}
          {data?.map((member) => (
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
                    {member.status.charAt(0).toUpperCase() +
                      member.status.slice(1).toLowerCase()}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleResendInvite(member.id)}
                  >
                    <Mail className="mr-2" />
                    {t("resendInvite")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRemoveInvite(member.id)}
                  >
                    <Trash2 className="mr-2" />
                    {t("removeMember")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { MembersTab };
