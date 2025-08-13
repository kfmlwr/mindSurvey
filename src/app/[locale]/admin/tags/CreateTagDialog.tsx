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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";
import React from "react";

const PREDEFINED_COLORS = [
  { name: "green", label: "Green" },
  { name: "blue", label: "Blue" },
  { name: "teal", label: "Teal" },
  { name: "indigo", label: "Indigo" },
  { name: "purple", label: "Purple" },
  { name: "pink", label: "Pink" },
  { name: "slate", label: "Slate" },
  { name: "yellow", label: "Yellow" },
  { name: "red", label: "Red" },
] as const;

// --- Variant 1: static class map (build-time safe) ---
type ColorName = (typeof PREDEFINED_COLORS)[number]["name"];
const COLOR_BG_500: Record<ColorName, string> = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  teal: "bg-teal-500",
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  slate: "bg-slate-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
};
// -----------------------------------------------------

const createTagSchema = z.object({
  label: z.string().min(1, "Tag label is required").max(50),
  color: z
    .enum([
      "green",
      "blue",
      "teal",
      "indigo",
      "purple",
      "pink",
      "slate",
      "yellow",
      "red",
    ])
    .optional(),
});

type CreateTagFormData = z.infer<typeof createTagSchema>;

interface CreateTagDialogProps {
  onTagCreated?: () => void;
}

export default function CreateTagDialog({
  onTagCreated,
}: CreateTagDialogProps) {
  const t = useTranslations("Admin");
  const [isOpen, setIsOpen] = React.useState(false);

  const trpc = useTRPC();

  const form = useForm<CreateTagFormData>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      label: "",
      color: undefined,
    },
  });

  const createTag = useMutation(
    trpc.admin.createTag.mutationOptions({
      onSuccess: () => {
        onTagCreated?.();
        form.reset();
        setIsOpen(false);
      },
    }),
  );

  const onSubmit: SubmitHandler<CreateTagFormData> = (data) => {
    const createPromise = createTag.mutateAsync({
      label: data.label,
      color: data.color,
    });

    toast.promise(createPromise, {
      loading: t("creatingTag"),
      success: t("tagCreatedSuccess"),
      error: (error) => t("tagCreatedError", { error: error.message }),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("createTag")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("createTagTitle")}</DialogTitle>
          <DialogDescription>{t("createTagDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tagLabelLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("tagLabelPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tagColorLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("tagColorPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PREDEFINED_COLORS.map((color) => (
                        <SelectItem key={color.name} value={color.name}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-4 w-4 rounded-full ${COLOR_BG_500[color.name]}`}
                            />
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Button type="submit" disabled={createTag.isPending}>
                {createTag.isPending ? t("creatingTag") : t("createTagSubmit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
