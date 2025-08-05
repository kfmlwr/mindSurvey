import { TRPCError } from "@trpc/server";
import { AuthError } from "next-auth";
import { getLocale } from "next-intl/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { signIn } from "~/server/auth";

export const inviteRouter = createTRPCRouter({
  getInvite: publicProcedure
    .input(z.object({ inviteToken: z.string() }))
    .query(async ({ ctx, input }) => {
      const invite = await ctx.db.invite.findUnique({
        where: { inviteToken: input.inviteToken },
      });
      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }
      return invite;
    }),

  getLeaderInvite: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const invite = await ctx.db.invite.findFirst({
        where: { userId: ctx.session.user.id, teamId: input.teamId },
      });
      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }
      return invite;
    }),
  createOwnSurveyToken: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        firstname: z.string(),
        lastname: z.string().optional(),
        termsAndConditions: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, firstname, lastname, termsAndConditions } = input;
      const locale = await getLocale();

      if (!termsAndConditions) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must accept the terms and conditions",
        });
      }

      let owner = await ctx.db.user.findFirst({
        where: { email },
      });

      owner ??= await ctx.db.user.create({
        data: {
          email,
          name: `${firstname ?? ""} ${lastname ?? ""}`,
          locale,
        },
      });

      const team = await ctx.db.team.create({
        data: {
          name: `${firstname ?? ""} ${lastname ?? ""}'s Team`,
          ownerId: owner.id,
        },
      });

      const token = randomBytes(64).toString("hex");

      const invite = await ctx.db.invite.create({
        data: {
          email,
          teamId: team.id,
          inviteToken: token,
          userId: owner.id,
        },
      });

      try {
        await signIn("resend", {
          email,
          redirectTo: `/${locale}/survey/${token}`,
        });
      } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
          return invite;
        }

        if (error instanceof AuthError) {
          return invite;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sign in",
        });
      }

      return invite;
    }),
});
