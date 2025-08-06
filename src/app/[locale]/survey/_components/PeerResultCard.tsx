import { useTranslations } from "next-intl";
import { Card, CardContent } from "~/components/ui/card";
import { Link } from "~/i18n/navigation";

export function PeerResultsCard() {
  const t = useTranslations("SurveyResult");
  return (
    <Card>
      <CardContent>
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-semibold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <div>
          <p>{t("peerText")}</p>
          <Link href="/">{t("createYourOwn")}</Link>
        </div>
      </CardContent>
    </Card>
  );
}
