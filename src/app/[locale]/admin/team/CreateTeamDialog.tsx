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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .min(2, "Team name must be at least 2 characters")
    .max(50, "Team name must be less than 50 characters"),
  ownerEmail: z
    .string()
    .min(1, "Owner email is required")
    .email("Please enter a valid email address"),
  members: z
    .array(
      z.object({
        email: z
          .string()
          .min(1, "Member email is required")
          .email("Please enter a valid email address"),
      })
    )
    .min(5, "At least 5 team members are required (in addition to the owner)")
    .refine(
      (members) => {
        const emails = members.map((m) => m.email.toLowerCase()).filter(email => email.trim());
        const uniqueEmails = new Set(emails);
        return uniqueEmails.size === emails.length;
      },
      { message: "All member emails must be unique" }
    ),
}).refine(
  (data) => {
    const ownerEmail = data.ownerEmail.toLowerCase();
    const memberEmails = data.members.map((m) => m.email.toLowerCase()).filter(email => email.trim());
    return !memberEmails.includes(ownerEmail);
  },
  {
    message: "Owner email cannot be the same as any team member email",
    path: ["members"],
  }
);

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

export default function CreateTeamDialog() {
  const t = useTranslations("Admin");
  const [isOpen, setIsOpen] = React.useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

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
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

  const createTeam = useMutation(
    trpc.admin.createTeam.mutationOptions({
      onSuccess: () => {
        // Invalidate and refetch teams
        void queryClient.invalidateQueries({
          queryKey: ["admin.getAllTeams"],
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
              
              <div className="text-sm text-muted-foreground">
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
                              placeholder={t("memberEmailPlaceholder", { index: index + 1 })}
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
                <div className="text-sm text-destructive">
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
