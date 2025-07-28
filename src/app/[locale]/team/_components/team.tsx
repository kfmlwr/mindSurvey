import { Mail, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

export default function MembersTab() {
  const t = useTranslations("TeamPage.teamTab");
  const teamMembers = [
    {
      id: 1,
      email: "muster@adress.de",
      status: "Pending",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 2,
      email: "muster@adress.de",
      status: "Pending",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 3,
      email: "muster@adress.de",
      status: "Pending",
      avatar: "/api/placeholder/40/40",
    },
  ];

  return (
    <div className="space-y-6 pt-6">
      {/* Add members section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">{t("title")}</h2>
        <div className="flex gap-2">
          <Input type="email" placeholder="E-Mail" className="flex-1" />
          <Button>{t("invite")}</Button>
        </div>
      </div>

      {/* Your team section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">{t("yourTeam")}</h2>
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-purple-500 text-white">
                    {member.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.email}</div>
                  <div className="text-muted-foreground text-sm">
                    {member.status}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Mail className="mr-2" />
                    {t("resendInvite")}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trash2 className="mr-2" />
                    {t("removeMember")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { MembersTab };
