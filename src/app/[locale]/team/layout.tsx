import { auth } from "~/server/auth";
import { getTranslations } from "next-intl/server";
import { Navbar } from "./_components/Navbar";

export default async function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const t = await getTranslations("Errors");

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">{t("notLoggedIn")}</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto space-y-8 px-4 md:px-6 md:py-6 lg:px-8">
      <Navbar />
      {children}
    </main>
  );
}
