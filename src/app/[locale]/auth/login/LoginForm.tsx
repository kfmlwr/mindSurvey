"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Link } from "~/i18n/navigation";
import { cn } from "~/lib/utils";
import { Logo } from "~/components/Logo";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";

type MessageType = {
  message: string;
  type: "success" | "error";
};
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("LoginPage");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<MessageType | null>(null);
  const locale = useLocale();
  const trpc = useTRPC();

  const loginMutation = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: () => {
        setMessage({
          message: t("successMessage"),
          type: "success",
        });
      },
      onError: () => {
        setMessage({
          message: t("errorMessage"),
          type: "error",
        });
      }
    })
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    loginMutation.mutate({ email, locale });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="relative mx-auto h-32 w-full max-w-xs">
            <Logo />
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loginMutation.isPending}
              />
            </div>

            {message && message.type === "success" && (
              <Alert>
                <CheckCircle2Icon />
                <AlertTitle> {message.message}</AlertTitle>
              </Alert>
            )}

            {message && message.type === "error" && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle> {message.message}</AlertTitle>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? t("loading") : t("loginButton")}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {t.rich("termsAndConditions", {
          tosLink: (chunks) => <Link href="/terms">{chunks}</Link>,
          ppLink: (chunks) => <Link href="/privacy">{chunks}</Link>,
        })}
      </div>
    </div>
  );
}
