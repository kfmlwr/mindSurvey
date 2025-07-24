import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";

export default function ResultsTab() {
  const teamMembers = [
    {
      id: 1,
      email: "muster@adress.de",
      status: "Completed on 21.10.2023",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 2,
      email: "muster@adress.de",
      status: "Completed on 21.10.2023",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 3,
      email: "muster@adress.de",
      status: "Completed on 21.10.2023",
      avatar: "/api/placeholder/40/40",
    },
  ];

  return (
    <div className="space-y-6 pt-6">
      {/* Your team section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Your team</h2>
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
                  <div className="font-medium text-gray-900">
                    {member.email}
                  </div>
                  <div className="text-sm text-gray-500">{member.status}</div>
                </div>
              </div>
              <Button variant={"default"} size={"sm"}>
                Results
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { ResultsTab };
