import { useTranslations } from "next-intl";
import { signIn } from "~/server/auth";

// Since this component doesn't use any interactive features
// from React, it can be run as a Server Component.

export default function HomePage() {
  const t = useTranslations("HomePage");
  return (
    <>
      <h1>{t("title")}</h1>
      <SignIn />
    </>
  );
}

export function SignIn() {
  return (
    <form
      action={async (formData) => {
        "use server";
        await signIn("resend", formData);
      }}
    >
      <input type="text" name="email" placeholder="Email" />
      <button type="submit">Signin with Resend</button>
    </form>
  );
}
