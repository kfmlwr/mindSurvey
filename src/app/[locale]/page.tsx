import { getLocale } from "next-intl/server";
import { redirect } from "~/i18n/navigation";
import { auth } from "~/server/auth";

export default async function HomePage() {
  const locale = await getLocale();

  const session = await auth();
  if (session) {
    return redirect({ href: "/team", locale });
  }
  return redirect({ href: "/auth/login", locale });
}
