"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Link } from "~/i18n/navigation";
import { useTRPC } from "~/trpc/react";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  agreeToContact: z.boolean().refine((value) => value === true, {
    message: "You must agree to be contacted",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function SurveyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      agreeToContact: false,
    },
  });

  const trpc = useTRPC();

  const createEmailMutation = useMutation(
    trpc.invite.createOwnSurveyToken.mutationOptions({
      onSuccess: () => {
        form.reset();
      },
      onError: (error) => {
        console.error("Error creating survey token:", error);
      },
    }),
  );

  const handleSubmit = (data: FormData) => {
    const promise = createEmailMutation.mutateAsync({
      email: data.email,
      firstname: data.firstName,
      lastname: data.lastName,
      termsAndConditions: data.agreeToContact,
    });

    toast.promise(promise, {
      loading: "Sending...",
      success: "Survey token sent successfully!",
      error: "Failed to send survey token",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="font-medium text-white">
                Firstname
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Firstname"
                  className="placeholder:text-muted-foreground bg-background/90 border-0"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="font-medium text-white">
                Last Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Last Name"
                  className="placeholder:text-muted-foreground bg-background/90 border-0"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="font-medium text-white">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="example@company.com"
                  className="placeholder:text-muted-foreground bg-background/90 border-0"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agreeToContact"
          render={({ field }) => (
            <FormItem className="pt-4">
              <div className="flex items-start space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="bg-background/90 mt-1 border-0 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
                  />
                </FormControl>
                <FormLabel className="cursor-pointer text-sm leading-relaxed text-emerald-100">
                  I agree that Mindclip can contact me on topics related to the
                  behaviour survey
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-background hover:bg-background/90 mt-6 w-full text-emerald-600 shadow-lg hover:shadow-none"
        >
          Get Access
        </Button>

        <p className="text-muted w-full text-center text-sm">
          Already created a team?{" "}
          <Link
            href={`/auth/login`}
            className="text-emerald-200 hover:underline"
          >
            Login here
          </Link>
        </p>
      </form>
    </Form>
  );
}
