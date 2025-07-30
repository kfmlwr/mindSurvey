import * as React from "react";

interface Props {
  url: string;
}

export const MagicLinkEmailTemplate: React.FC<Props> = ({ url }) => (
  <div>
    <h1>Login</h1>
    <a href={url}>Hier klicken, um sich einzuloggen</a>
  </div>
);
