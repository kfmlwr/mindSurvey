"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
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
import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateTeamDialogProps {
  callback?: () => void;
}

export function CreateTeamDialog({ callback }: CreateTeamDialogProps) {
  const t = useTranslations("TeamOverviewPage.createTeamDialog");

  const createTeamSchema = z.object({
    name: z.string().min(1, t("nameError")),
  });

  type CreateTeamFormData = z.infer<typeof createTeamSchema>;

  const form = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
    },
  });

  const trpc = useTRPC();

  const createTeamMutation = useMutation(
    trpc.team.createTeam.mutationOptions({
      onSuccess: () => {
        form.reset();
        if (callback) {
          callback();
        }
      },
      onError: (error) => {
        console.error("Error creating team:", error);
        if (callback) {
          callback();
        }
      },
    }),
  );

  const onSubmit = (data: CreateTeamFormData) => {
    const promise = createTeamMutation.mutateAsync(data);

    toast.promise(promise, {
      loading: t("loading"),
      success: t("successMessage"),
      error: t("errorMessage"),
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus /> {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
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
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("cancelButton")}</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit">{t("createButton")}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
