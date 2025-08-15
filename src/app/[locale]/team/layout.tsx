import { auth } from "~/server/auth";
import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "./_components/Navbar";
import { redirect } from "~/i18n/navigation";

export default async function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("Errors");

  if (!session) {
    return redirect({ href: "/", locale });
  }

  return (
    <main className="container mx-auto space-y-8 px-4 md:px-6 md:py-6 lg:px-8">
      <Navbar />
      {children}
    </main>
  );
}
