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
import { Badge } from "~/components/ui/badge";
import {
  Calendar,
  Users,
  Mail,
  Shield,
  ShieldCheck,
  Trash2,
  MoreHorizontal,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useTRPC, type RouterOutputs } from "~/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import CreateAdminDialog from "./CreateAdminDialog";

type UserData = RouterOutputs["admin"]["getAllUsers"][number];

interface Props {
  users?: UserData[];
}

export default function AdminUsersPage({ users }: Props) {
  const t = useTranslations("AdminUsers");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<string | null>(
    null,
  );

  const trpc = useTRPC();

  const { data, isLoading, refetch } = useQuery(
    trpc.admin.getAllUsers.queryOptions(undefined, { initialData: users }),
  );

  const deleteUser = useMutation(
    trpc.admin.deleteUser.mutationOptions({
      onSuccess: () => {
        void refetch();
        setDeleteDialogOpen(null);
      },
      onError: () => {
        setDeleteDialogOpen(null);
      },
    }),
  );

  const updateUserRole = useMutation(
    trpc.admin.updateUserRole.mutationOptions({
      onSuccess: () => {
        void refetch();
      },
    }),
  );

  const handleDeleteUser = (userId: string) => {
    const deletePromise = deleteUser.mutateAsync({ userId });

    toast.promise(deletePromise, {
      loading: t("deletingUser"),
      success: t("userDeletedSuccess"),
      error: (error) => t("userDeletedError", { error: error.message }),
    });
  };

  const handleToggleRole = (userId: string, currentRole: "USER" | "ADMIN") => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const rolePromise = updateUserRole.mutateAsync({ userId, role: newRole });

    toast.promise(rolePromise, {
      loading: t("updatingUserRole"),
      success: t("userRoleUpdated"),
      error: (error) => t("userRoleUpdateError", { error: error.message }),
    });
  };

  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("name") || "Unknown"}</div>
          <div className="text-muted-foreground text-sm">
            {row.getValue("email")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: t("email"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="font-mono text-sm">{row.getValue("email")}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: t("role"),
      cell: ({ row }) => {
        const role = row.getValue("role") as "USER" | "ADMIN";
        return (
          <div className="flex items-center gap-2">
            {role === "ADMIN" ? (
              <>
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <Badge variant="default">{t("admin")}</Badge>
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 text-gray-500" />
                <Badge variant="secondary">{t("user")}</Badge>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "ownedTeams",
      header: t("ownedTeams"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{row.getValue("ownedTeams")}</span>
        </div>
      ),
    },
    {
      accessorKey: "invitations",
      header: t("invitations"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>{row.getValue("invitations")}</span>
        </div>
      ),
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
        const user = row.original;

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
                onClick={() => handleToggleRole(user.id, user.role)}
                disabled={updateUserRole.isPending}
              >
                {user.role === "ADMIN" ? (
                  <>
                    <Shield className="h-4 w-4" />
                    {t("removeAdmin")}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    {t("makeAdmin")}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(user.id)}
                disabled={deleteUser.isPending}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="text-destructive h-4 w-4" />
                {t("deleteUser")}
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
            <CardTitle>{t("usersOverview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Loading users...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("usersOverview")}</CardTitle>
          <p className="text-muted-foreground">{t("manageUsers")}</p>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data || []}
            emptyMessage={t("noUsersFound")}
            enableRowSelection={false}
            disableColumnVisibility={false}
            buttons={<CreateAdminDialog />}
          />
        </CardContent>
      </Card>

      {/* Delete User Dialog */}
      <AlertDialog
        open={!!deleteDialogOpen}
        onOpenChange={() => setDeleteDialogOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteUserTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogOpen &&
                t("deleteUserDescription", {
                  userName:
                    data?.find((user) => user.id === deleteDialogOpen)?.name ||
                    "",
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteDialogOpen && handleDeleteUser(deleteDialogOpen)
              }
            >
              {t("deleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}