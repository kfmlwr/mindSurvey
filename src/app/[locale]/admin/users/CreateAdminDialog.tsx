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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

const createAdminSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

export default function CreateAdminDialog() {
  const t = useTranslations("AdminUsers");
  const [isOpen, setIsOpen] = React.useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const createAdmin = useMutation(
    trpc.admin.createAdmin.mutationOptions({
      onSuccess: () => {
        // Invalidate and refetch users
        void queryClient.invalidateQueries({
          queryKey: ["admin.getAllUsers"],
        });
        form.reset();
        setIsOpen(false);
      },
    }),
  );

  const onSubmit = (data: CreateAdminFormData) => {
    const createPromise = createAdmin.mutateAsync(data);

    toast.promise(createPromise, {
      loading: t("creatingAdmin"),
      success: t("adminCreatedSuccess"),
      error: (error) => t("adminCreatedError", { error: error.message }),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus />
          {t("createAdmin")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("createAdminTitle")}</DialogTitle>
          <DialogDescription>{t("createAdminDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("nameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("emailLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
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
                onClick={() => setIsOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createAdmin.isPending}>
                {createAdmin.isPending
                  ? t("creatingAdmin")
                  : t("createAdminSubmit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}