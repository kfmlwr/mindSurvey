"use client";

import { GalleryVerticalEnd } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Link } from "~/i18n/navigation";
import { cn } from "~/lib/utils";
import { loginAction } from "./actions";

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
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await loginAction(email);

      if (result.success) {
        setMessage({
          message: t("successMessage"),
          type: "success",
        });
      } else {
        setMessage({
          message: t("errorMessage"),
          type: "error",
        });
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">MindClip</span>
            </a>
            <h1 className="text-xl font-bold">{t("welcomeMessage")}</h1>
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
                disabled={isPending}
              />
            </div>
            {message && (
              <div
                className={cn(
                  "rounded p-2 text-center text-sm",
                  message.type === "success"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600",
                )}
              >
                {message.message}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Sending..." : t("loginButton")}
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
