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
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useTRPC, type RouterOutputs } from "~/trpc/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import React from "react";
import { Badge } from "~/components/ui/badge";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
} from "~/components/ui/multi-select";

const updateTeamSchema = z
  .object({
    name: z.string().min(1, "Team name is required").min(2).max(50),
    ownerEmail: z.string().min(1, "Owner email is required").email(),
    newMembers: z
      .array(
        z.object({
          email: z.string().min(1, "Member email is required").email(),
        }),
      )
      .default([]),
    tagIds: z.array(z.string()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    const owner = data.ownerEmail.trim().toLowerCase();
    const newMemberEmails = data.newMembers.map((m) =>
      m.email.trim().toLowerCase(),
    );

    // Owner cannot be in new members list
    newMemberEmails.forEach((e, i) => {
      if (e && e === owner) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newMembers", i, "email"],
          message: "Owner email cannot be the same as any team member email",
        });
      }
    });

    // New member emails must be unique
    const seen = new Map<string, number>();
    newMemberEmails.forEach((e, i) => {
      if (!e) return;
      if (seen.has(e)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newMembers", i, "email"],
          message: "All member emails must be unique",
        });
        const firstIndex = seen.get(e)!;
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newMembers", firstIndex, "email"],
          message: "All member emails must be unique",
        });
      } else {
        seen.set(e, i);
      }
    });
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

  // Get detailed team information including members
  const { data: teamDetails, isLoading: isLoadingTeamDetails } = useQuery(
    trpc.admin.getTeamDetails.queryOptions(
      { teamId: team.id },
      { enabled: open },
    ),
  );

  // Get all available tags
  const { data: tags = [] } = useQuery(trpc.admin.getAllTags.queryOptions());

  const form = useForm({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      name: team.name,
      ownerEmail: team.owner?.email || "",
      newMembers: [],
      tagIds: team.tags?.map((t) => t.id) || [],
    } as UpdateTeamFormData,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "newMembers",
  });

  React.useEffect(() => {
    if (open && team) {
      form.reset({
        name: team.name,
        ownerEmail: team.owner?.email || "",
        newMembers: [],
        tagIds: team.tags?.map((t) => t.id) || [],
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
        void queryClient.invalidateQueries({
          queryKey: trpc.admin.getTeamDetails.queryKey({ teamId: team.id }),
        });
        onOpenChange(false);
      },
    }),
  );

  const addTeamMember = useMutation(
    trpc.admin.addTeamMember.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.admin.getTeamDetails.queryKey({ teamId: team.id }),
        });
      },
    }),
  );

  const removeTeamMember = useMutation(
    trpc.admin.removeTeamMember.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.admin.getTeamDetails.queryKey({ teamId: team.id }),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKey,
        });
      },
    }),
  );

  const handleRemoveMember = async (inviteId: string) => {
    const removePromise = removeTeamMember.mutateAsync({
      teamId: team.id,
      inviteId,
    });

    toast.promise(removePromise, {
      loading: t("removingMember"),
      success: t("memberRemovedSuccess"),
      error: (error) => t("memberRemovedError", { error: error.message }),
    });
  };

  const onSubmit: SubmitHandler<UpdateTeamFormData> = async (data) => {
    try {
      // Check if adding new members would exceed the 5-member limit
      const currentMemberCount = existingMembers.length + 1; // +1 for owner
      const newMembersCount = data.newMembers.filter(m => m.email.trim()).length;
      const totalMemberCount = currentMemberCount + newMembersCount;

      if (totalMemberCount > 5) {
        toast.error(`Cannot add ${newMembersCount} member(s). Team would have ${totalMemberCount} members, but exactly 5 are required.`);
        return;
      }

      // Update basic team info and tags
      await updateTeam.mutateAsync({
        teamId: team.id,
        name: data.name,
        ownerEmail: data.ownerEmail,
        tagIds: data.tagIds,
      });

      // Add new members
      for (const member of data.newMembers) {
        if (member.email.trim()) {
          await addTeamMember.mutateAsync({
            teamId: team.id,
            email: member.email,
          });
        }
      }

      toast.success(t("teamUpdatedSuccess"));
    } catch (error: any) {
      toast.error(t("teamUpdatedError", { error: error.message }));
    }
  };

  if (isLoadingTeamDetails) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("updateTeamTitle")}</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">Loading team details...</div>
        </DialogContent>
      </Dialog>
    );
  }

  const existingMembers =
    teamDetails?.invitations?.filter(
      (invite) => invite.userId !== teamDetails.ownerId,
    ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("updateTeamTitle")}</DialogTitle>
          <DialogDescription>{t("updateTeamDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <FormField
              control={form.control}
              name="tagIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tagsLabel")}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      values={field.value}
                      onValuesChange={field.onChange}
                    >
                      <MultiSelectTrigger className="w-full">
                        <MultiSelectValue placeholder={t("selectTags")} />
                      </MultiSelectTrigger>
                      <MultiSelectContent emptyMessage={t("noTagsAvailable")}>
                        {tags.map((tag) => (
                          <MultiSelectItem key={tag.id} value={tag.id}>
                            <div className="flex items-center gap-2">
                              {tag.color && (
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: tag.color }}
                                />
                              )}
                              {tag.label}
                            </div>
                          </MultiSelectItem>
                        ))}
                      </MultiSelectContent>
                    </MultiSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Existing Members Section */}
            {existingMembers.length > 0 && (
              <div className="space-y-3">
                <FormLabel className="text-base font-medium">
                  {t("currentMembers")} ({existingMembers.length})
                </FormLabel>
                <div className="space-y-2">
                  {existingMembers.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-muted-foreground text-sm">
                          {invite.email}
                        </div>

                        <Badge
                          variant={
                            invite.status === "COMPLETED"
                              ? "default"
                              : invite.status === "PENDING"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {invite.status}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(invite.id)}
                        disabled={removeTeamMember.isPending}
                      >
                        <X className="h-4 w-4" />
                        {t("removeMember")}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Members Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">
                  {t("addNewMembers")} ({fields.length})
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ email: "" })}
                  disabled={(existingMembers.length + 1 + fields.length) >= 5}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {t("addMember")}
                </Button>
              </div>

              {(existingMembers.length + 1) >= 5 && (
                <div className="text-muted-foreground text-sm">
                  {t("teamAlreadyHasMaxMembers")}
                </div>
              )}
              {(existingMembers.length + 1) < 5 && (
                <div className="text-muted-foreground text-sm">
                  {t("canAdd")} {5 - (existingMembers.length + 1)} {t("moreMembers")}
                </div>
              )}

              {fields.length > 0 && (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                      <FormField
                        control={form.control}
                        name={`newMembers.${index}.email`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={t("memberEmailPlaceholder", {
                                  index: index + 1,
                                })}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateTeam.isPending || addTeamMember.isPending}
              >
                {updateTeam.isPending || addTeamMember.isPending
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
