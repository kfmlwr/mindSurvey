"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DataTable } from "~/components/table/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  MoreHorizontal,
  Eye,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useTRPC, type RouterOutputs } from "~/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import CreateTeamDialog from "./CreateTeamDialog";
import AdminTeamResultsDialog from "./AdminTeamResultsDialog";
import UpdateTeamDialog from "./UpdateTeamDialog";

type TeamData = RouterOutputs["admin"]["getAllTeams"][number];

interface Props {
  teams?: TeamData[];
}

export default function TeamAdminPage({ teams }: Props) {
  const t = useTranslations("Admin");
  const [releaseDialogOpen, setReleaseDialogOpen] = React.useState<
    string | null
  >(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<string | null>(
    null,
  );
  const [viewResultsDialogOpen, setViewResultsDialogOpen] = React.useState<
    string | null
  >(null);
  const [updateTeamDialogOpen, setUpdateTeamDialogOpen] = React.useState<
    string | null
  >(null);

  const trpc = useTRPC();

  const { data, isLoading, refetch } = useQuery(
    trpc.admin.getAllTeams.queryOptions(undefined, { initialData: teams }),
  );

  const releaseTeamResults = useMutation(
    trpc.admin.releaseTeamResults.mutationOptions({
      onSuccess: () => {
        void refetch();
        setReleaseDialogOpen(null);
      },
      onError: () => {
        setReleaseDialogOpen(null);
      },
    }),
  );

  const deleteTeam = useMutation(
    trpc.admin.deleteTeam.mutationOptions({
      onSuccess: () => {
        void refetch();
        setDeleteDialogOpen(null);
      },
      onError: () => {
        setDeleteDialogOpen(null);
      },
    }),
  );

  const handleReleaseResults = (teamId: string) => {
    const releasePromise = releaseTeamResults.mutateAsync({ teamId });

    toast.promise(releasePromise, {
      loading: t("releasing"),
      success: t("releaseSuccess"),
      error: (error) => t("releaseError", { error: error.message }),
    });
  };

  const handleDeleteTeam = (teamId: string) => {
    const deletePromise = deleteTeam.mutateAsync({ teamId });

    toast.promise(deletePromise, {
      loading: t("deletingTeam"),
      success: t("teamDeletedSuccess"),
      error: (error) => t("teamDeletedError", { error: error.message }),
    });
  };

  const columns: ColumnDef<TeamData>[] = [
    {
      accessorKey: "name",
      header: t("teamName"),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "owner",
      header: t("owner"),
      cell: ({ row }) => {
        const owner = row.getValue("owner") as TeamData["owner"];
        return (
          <div>
            <div className="font-medium">{owner?.name || "Unknown"}</div>
            <div className="text-muted-foreground text-sm">{owner?.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "memberCount",
      header: t("members"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{row.getValue("memberCount")}</span>
        </div>
      ),
    },
    {
      accessorKey: "completedSurveys",
      header: t("completed"),
      cell: ({ row }) => {
        const completed = row.getValue("completedSurveys") as number;
        const total = row.getValue("memberCount") as number;
        const percentage =
          total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>
              {completed}/{total}
            </span>
            <Badge variant={percentage === 100 ? "default" : "secondary"}>
              {percentage}%
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "releasedResults",
      header: t("released"),
      cell: ({ row }) => {
        const data = row.original;

        return (
          <div>
            {!data.isResultsReleased ? (
              <Clock className="text-destructive h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "tags",
      header: t("tags"),
      cell: ({ row }) => {
        const tags = row.original.tags || [];

        return (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className={`bg-${tag.color}-500`}
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("created"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(row.getValue("createdAt")).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const team = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setUpdateTeamDialogOpen(team.id)}
              >
                <Edit className="h-4 w-4" />
                {t("editTeam")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewResultsDialogOpen(team.id)}
              >
                <Eye className="h-4 w-4" />
                {t("viewResults")}
              </DropdownMenuItem>

              {!team.isResultsReleased && (
                <DropdownMenuItem
                  onClick={() => setReleaseDialogOpen(team.id)}
                  disabled={releaseTeamResults.isPending}
                >
                  <AlertCircle className="h-4 w-4" />
                  {t("releaseResults")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(team.id)}
                disabled={deleteTeam.isPending}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="text-destructive h-4 w-4" />
                {t("deleteTeam")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("teamsOverview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Loading teams...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("teamsOverview")}</CardTitle>
          <p className="text-muted-foreground">{t("manageTeams")}</p>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data || []}
            emptyMessage={t("noTeamsFound")}
            enableRowSelection={false}
            disableColumnVisibility={false}
            buttons={<CreateTeamDialog />}
          />
        </CardContent>
      </Card>

      {/* Release Results Dialog */}
      <AlertDialog
        open={!!releaseDialogOpen}
        onOpenChange={() => setReleaseDialogOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("releaseTeamResultsTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {releaseDialogOpen &&
                t("releaseTeamResultsDescription", {
                  teamName:
                    data?.find((team) => team.id === releaseDialogOpen)?.name ||
                    "",
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                releaseDialogOpen && handleReleaseResults(releaseDialogOpen)
              }
            >
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Team Dialog */}
      <AlertDialog
        open={!!deleteDialogOpen}
        onOpenChange={() => setDeleteDialogOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTeamTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogOpen &&
                t("deleteTeamDescription", {
                  teamName:
                    data?.find((team) => team.id === deleteDialogOpen)?.name ||
                    "",
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteDialogOpen && handleDeleteTeam(deleteDialogOpen)
              }
            >
              {t("deleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Results Dialog */}
      <AdminTeamResultsDialog
        teamId={viewResultsDialogOpen}
        open={!!viewResultsDialogOpen}
        onOpenChange={() => setViewResultsDialogOpen(null)}
      />

      {/* Update Team Dialog */}
      {updateTeamDialogOpen && (
        <UpdateTeamDialog
          team={data?.find((team) => team.id === updateTeamDialogOpen)!}
          open={!!updateTeamDialogOpen}
          onOpenChange={() => setUpdateTeamDialogOpen(null)}
        />
      )}
    </div>
  );
}
