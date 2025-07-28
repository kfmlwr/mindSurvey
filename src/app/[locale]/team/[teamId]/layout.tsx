import { auth } from "~/server/auth";
import { Navbar } from "../_components/navigation";
import { getTranslations } from "next-intl/server";

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
    <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <Navbar />
      {children}
    </main>
  );
}
