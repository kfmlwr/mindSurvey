import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import { default as ResendProvider } from "next-auth/providers/resend";
import { Resend } from "resend";
import { env } from "~/env";

import { db } from "~/server/db";
import { MagicLinkEmailTemplate } from "../emails/MagicLink";
import type { PrismaClient } from "@prisma/client";

const resend = new Resend(env.AUTH_RESEND_KEY);

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

function CustomPrismaAdapter(prisma: PrismaClient) {
  const base = PrismaAdapter(prisma);

  return {
    ...base,
    async deleteSession(sessionToken: string) {
      // deleteMany statt delete!
      await prisma.session.deleteMany({
        where: { sessionToken },
      });
      // deleteMany gibt einfach { count: 0 } zurück, wenn nichts gelöscht wurde (kein Fehler!)
      return null;
    },
  };
}
export const authConfig = {
  providers: [
    ResendProvider({
      from: "auth@casanoova.de",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const res = await resend.emails.send({
          from: env.EMAIL_FROM,
          to: [email],
          subject: "Login to MindClip",
          react: await MagicLinkEmailTemplate({
            url,
          }),
        });

        if (res.error) {
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
  adapter: {
    ...CustomPrismaAdapter(db),
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;
