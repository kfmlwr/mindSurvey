import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AppSidebar } from "./_components/AppSidebar";
import { ThemeToggle } from "~/components/ThemeToggle";
import Breadcrumbs from "./_components/Breadcrumbs";
import LocaleSwitch from "~/components/LanguageSwitch";
import { auth } from "~/server/auth";
import { redirect } from "~/i18n/navigation";
import { getLocale } from "next-intl/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const locale = await getLocale();

  if (!session) {
    return redirect({ href: "/auth/login", locale });
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="items-cnter flex h-16 shrink-0 justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />

            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-2">
            <LocaleSwitch />
            <ThemeToggle />
          </div>
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
