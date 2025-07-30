import { useTranslations } from "next-intl";
import LocaleSwitch from "~/components/LanguageSwitch";
import { Link } from "~/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("HomePage");
  return (
    <>
      <h1>{t("title")}</h1>
      <Link href={"auth/login"}>Login</Link>
      <LocaleSwitch />
    </>
  );
}
