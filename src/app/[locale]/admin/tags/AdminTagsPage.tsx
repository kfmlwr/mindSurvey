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
import { TagBadge } from "~/components/ui/tag-badge";
import {
  Calendar,
  MoreHorizontal,
  Trash2,
  Tag,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useTRPC, type RouterOutputs } from "~/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import CreateTagDialog from "./CreateTagDialog";

type TagData = RouterOutputs["admin"]["getAllTags"][number];

const COLOR_LABELS: Record<string, string> = {
  green: "Green",
  blue: "Blue", 
  teal: "Teal",
  indigo: "Indigo",
  purple: "Purple",
  pink: "Pink",
  slate: "Slate",
  zinc: "Zinc",
  yellow: "Yellow",
  red: "Red",
};

interface Props {
  tags?: TagData[];
}

export default function AdminTagsPage({ tags }: Props) {
  const t = useTranslations("Admin");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<string | null>(
    null,
  );

  const trpc = useTRPC();

  const { data, isLoading, refetch } = useQuery(
    trpc.admin.getAllTags.queryOptions(undefined, { initialData: tags }),
  );

  const deleteTag = useMutation(
    trpc.admin.deleteTag.mutationOptions({
      onSuccess: () => {
        void refetch();
        setDeleteDialogOpen(null);
      },
      onError: () => {
        setDeleteDialogOpen(null);
      },
    }),
  );

  const handleDeleteTag = (tagId: string) => {
    const deletePromise = deleteTag.mutateAsync({ tagId });

    toast.promise(deletePromise, {
      loading: t("deletingTag"),
      success: t("tagDeletedSuccess"),
      error: (error) => t("tagDeletedError", { error: error.message }),
    });
  };

  const columns: ColumnDef<TagData>[] = [
    {
      accessorKey: "label",
      header: t("tagLabel"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <span className="font-medium">{row.getValue("label")}</span>
        </div>
      ),
    },
    {
      accessorKey: "color",
      header: t("tagColor"),
      cell: ({ row }) => {
        const color = row.getValue("color") as string;
        const label = row.getValue("label") as string;
        return (
          <div className="flex items-center gap-2">
            <TagBadge
              label={label}
              color={color}
              variant="outline"
              showColorDot={true}
            />
            {color && (
              <span className="text-sm text-muted-foreground">
                {COLOR_LABELS[color] || color}
              </span>
            )}
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
        const tag = row.original;

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
                onClick={() => setDeleteDialogOpen(tag.id)}
                disabled={deleteTag.isPending}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="text-destructive h-4 w-4" />
                {t("deleteTag")}
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
            <CardTitle>{t("tagsOverview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Loading tags...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("tagsOverview")}</CardTitle>
          <p className="text-muted-foreground">{t("manageTags")}</p>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data || []}
            emptyMessage={t("noTagsFound")}
            enableRowSelection={false}
            disableColumnVisibility={false}
            buttons={<CreateTagDialog onTagCreated={() => void refetch()} />}
          />
        </CardContent>
      </Card>

      {/* Delete Tag Dialog */}
      <AlertDialog
        open={!!deleteDialogOpen}
        onOpenChange={() => setDeleteDialogOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTagTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogOpen &&
                t("deleteTagDescription", {
                  tagLabel:
                    data?.find((tag) => tag.id === deleteDialogOpen)?.label ||
                    "",
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteDialogOpen && handleDeleteTag(deleteDialogOpen)
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