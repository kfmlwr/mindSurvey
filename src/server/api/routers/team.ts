import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Resend } from "resend";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { InviteMemberEmailTemplate } from "~/server/emails/InviteMember";
import { env } from "~/env";

const resend = new Resend(env.AUTH_RESEND_KEY);

export const teamRouter = createTRPCRouter({
  getStats: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const teamId = input.teamId;

      const team = await ctx.db.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      if (team.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to view this team's stats",
        });
      }

      const inviteCount = await ctx.db.invite.count({
        where: { teamId: team.id },
      });

      const completedInvites = await ctx.db.invite.count({
        where: {
          teamId: team.id,
          status: "COMPLETED",
        },
      });

      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(team.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      return {
        memberCount: inviteCount,
        completedSurveys: completedInvites,
        daysSinceCreated,
      };
    }),

  inviteMember: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        teamId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, teamId } = input;

      const userTeamMember = await ctx.db.teamMember.findFirst({
        where: { userId: ctx.session.user.id, teamId },
      });

      if (!userTeamMember || userTeamMember.role !== "LEADER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to invite members",
        });
      }

      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      // Logic to send an invitation email would go here

      const { data, error } = await resend.emails.send({
        from: "casanoova <onboarding@casanoova.de>",
        to: [input.email],
        subject: "Einladung zu casanoova",
        react: await InviteMemberEmailTemplate({
          inviterName: ctx.session.user.name,
          token: ctx.session.user.token,
        }),
      });

      return { success: true, message: "Invitation sent successfully" };
    }),
});
