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

export default function MembersTab() {
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
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Add members
        </h2>
        <div className="flex gap-2">
          <Input type="email" placeholder="Email" className="flex-1" />
          <Button className="bg-gray-800 px-6 text-white hover:bg-gray-900">
            Invite
          </Button>
        </div>
      </div>

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Invitation
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
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
