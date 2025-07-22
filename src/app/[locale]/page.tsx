import { useTranslations } from "next-intl";

// Since this component doesn't use any interactive features
// from React, it can be run as a Server Component.

export default function HomePage() {
  const t = useTranslations("HomePage");
  return <h1>{t("title")}</h1>;
}
