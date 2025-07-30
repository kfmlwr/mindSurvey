import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "~/i18n/routing";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { Toaster } from "~/components/ui/sonner";
import LocaleSwitch from "~/components/LanguageSwitch";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "~/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Mindclip",
  description: "Mindclip",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${geist.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="white">
          <NextIntlClientProvider messages={messages} locale={locale}>
            <TRPCReactProvider>
              <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                <LocaleSwitch />
                <ThemeToggle />
              </div>
              {children}
              <Toaster />
            </TRPCReactProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
