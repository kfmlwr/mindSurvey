import * as React from "react";

interface InviteUserEmailTemplateProps {
  inviterName?: string;
  url: string;
}

export const InviteMemberEmailTemplate: React.FC<
  InviteUserEmailTemplateProps
> = ({ inviterName, url }) => (
  <div>
    <h1>You have been invited to join a team</h1>
    <p>From: {inviterName}</p>
    <a href={url}>Link: {url}</a>
  </div>
);
