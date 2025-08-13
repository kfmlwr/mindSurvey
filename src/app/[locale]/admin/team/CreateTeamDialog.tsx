"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import React from "react";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
} from "~/components/ui/multi-select";

const createTeamSchema = z
  .object({
    name: z.string().min(1, "Team name is required").min(2).max(50),
    ownerEmail: z.string().min(1, "Owner email is required").email(),
    members: z
      .array(
        z.object({
          email: z.string().min(1, "Member email is required").email(),
        }),
      )
      .min(
        5,
        "At least 5 team members are required (in addition to the owner)",
      ),
    tagIds: z.array(z.string()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    const owner = data.ownerEmail.trim().toLowerCase();
    const emails = data.members.map((m) => m.email.trim().toLowerCase());

    // Owner darf nicht in Members sein
    emails.forEach((e, i) => {
      if (e && e === owner) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["members", i, "email"],
          message: "Owner email cannot be the same as any team member email",
        });
      }
    });

    // Member-Emails müssen unique sein
    const seen = new Map<string, number>();
    emails.forEach((e, i) => {
      if (!e) return;
      if (seen.has(e)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["members", i, "email"],
          message: "All member emails must be unique",
        });
        const firstIndex = seen.get(e)!;
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["members", firstIndex, "email"],
          message: "All member emails must be unique",
        });
      } else {
        seen.set(e, i);
      }
    });
  });

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

export default function CreateTeamDialog() {
  const t = useTranslations("Admin");
  const [isOpen, setIsOpen] = React.useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Get all available tags
  const { data: tags = [] } = useQuery(
    trpc.admin.getAllTags.queryOptions(),
  );

  const form = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      ownerEmail: "",
      members: [
        { email: "" },
        { email: "" },
        { email: "" },
        { email: "" },
        { email: "" },
      ],
      tagIds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

  const queryKey = trpc.admin.getAllTeams.queryKey();

  const createTeam = useMutation(
    trpc.admin.createTeam.mutationOptions({
      onSuccess: () => {
        // Invalidate and refetch teams
        void queryClient.invalidateQueries({
          queryKey: queryKey,
        });
        form.reset();
        setIsOpen(false);
      },
    }),
  );

  const onSubmit = (data: CreateTeamFormData) => {
    const createPromise = createTeam.mutateAsync(data);

    toast.promise(createPromise, {
      loading: t("creatingTeam"),
      success: t("teamCreatedSuccess"),
      error: (error) => t("teamCreatedError", { error: error.message }),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t("createTeam")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("createTeamTitle")}</DialogTitle>
          <DialogDescription>{t("createTeamDescription")}</DialogDescription>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">
                  {t("teamMembersLabel")} ({fields.length}/∞)
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ email: "" })}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {t("addMember")}
                </Button>
              </div>

              <div className="text-muted-foreground text-sm">
                {t("minimumMembersNote")}
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <FormField
                      control={form.control}
                      name={`members.${index}.email`}
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
                    {fields.length > 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {form.formState.errors.members && (
                <div className="text-destructive text-sm">
                  {form.formState.errors.members.message}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createTeam.isPending}>
                {createTeam.isPending
                  ? t("creatingTeam")
                  : t("createTeamSubmit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
