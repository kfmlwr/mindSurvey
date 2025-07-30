import * as React from "react";

interface InviteUserEmailTemplateProps {
  inviterName?: string;
  token: string;
}

export const InviteMemberEmailTemplate: React.FC<
  InviteUserEmailTemplateProps
> = ({ inviterName, token }) => (
  <div>
    <h1>Sie wurden eingeladen</h1>
    <p>Von: {inviterName}</p>
    <p>Token: {token}</p>
  </div>
);
