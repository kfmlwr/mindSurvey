import { getLocale } from "next-intl/server";
import { redirect } from "~/i18n/navigation";

export default async function HomePage() {
  const locale = await getLocale();
  return redirect({ href: "/auth/login", locale });
}
