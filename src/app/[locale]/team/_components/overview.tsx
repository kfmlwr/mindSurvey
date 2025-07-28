import { Card, CardContent } from "~/components/ui/card";
import { Users, FileText, Calendar, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: number | string;
  description: string;
};

const StatCard = ({ icon, label, value, description }: StatCardProps) => (
  <Card>
    <CardContent>
      <div className="mb-4 flex items-center gap-2">
        {React.createElement(icon, {
          className: "size-5 text-muted-foreground",
        })}
        <span className="text-muted-foreground text-sm font-medium">
          {label}
        </span>
      </div>
      <div className="mb-2 text-4xl font-bold">{value}</div>
      <p className="text-muted-foreground/70 text-sm">{description}</p>
    </CardContent>
  </Card>
);

export default function OverviewTab() {
  const t = useTranslations("TeamPage.overviewTab");

  return (
    <div className="space-y-6 pt-6">
      <h2 className="mb-4 text-xl font-semibold">{t("title")}</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          icon={Users}
          label={t("teamMembers")}
          value={6}
          description={t("addMembers")}
        />

        <StatCard
          icon={FileText}
          label={t("responses")}
          value={4}
          description={t("sendReminders")}
        />

        <StatCard
          icon={Calendar}
          label={t("daysSinceCreation")}
          value={12}
          description={t("daysSinceCreationDescription")}
        />
      </div>
    </div>
  );
}
export { OverviewTab };
