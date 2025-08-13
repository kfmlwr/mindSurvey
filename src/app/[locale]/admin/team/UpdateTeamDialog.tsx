"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Edit } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useTRPC, type RouterOutputs } from "~/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

const updateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").min(2).max(50),
  ownerEmail: z.string().min(1, "Owner email is required").email(),
});

type UpdateTeamFormData = z.infer<typeof updateTeamSchema>;
type TeamData = RouterOutputs["admin"]["getAllTeams"][number];

interface UpdateTeamDialogProps {
  team: TeamData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateTeamDialog({
  team,
  open,
  onOpenChange,
}: UpdateTeamDialogProps) {
  const t = useTranslations("Admin");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<UpdateTeamFormData>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      name: team.name,
      ownerEmail: team.owner?.email || "",
    },
  });

  React.useEffect(() => {
    if (open && team) {
      form.reset({
        name: team.name,
        ownerEmail: team.owner?.email || "",
      });
    }
  }, [open, team, form]);

  const queryKey = trpc.admin.getAllTeams.queryKey();

  const updateTeam = useMutation(
    trpc.admin.updateTeam.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: queryKey,
        });
        onOpenChange(false);
      },
    }),
  );

  const onSubmit = (data: UpdateTeamFormData) => {
    const updatePromise = updateTeam.mutateAsync({
      teamId: team.id,
      name: data.name,
      ownerEmail: data.ownerEmail,
    });

    toast.promise(updatePromise, {
      loading: t("updatingTeam"),
      success: t("teamUpdatedSuccess"),
      error: (error) => t("teamUpdatedError", { error: error.message }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("updateTeamTitle")}</DialogTitle>
          <DialogDescription>{t("updateTeamDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teamNameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("teamNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ownerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ownerEmailLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("ownerEmailPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={updateTeam.isPending}>
                {updateTeam.isPending
                  ? t("updatingTeam")
                  : t("updateTeamSubmit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}