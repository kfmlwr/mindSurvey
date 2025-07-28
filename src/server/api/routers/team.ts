import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { InviteMemberEmailTemplate } from "~/server/emails/InviteMember";

export const teamRouter = createTRPCRouter({
  stats: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const teamId = input.teamId;

      const userTeamMember = await ctx.db.teamMember.findFirst({
        where: { userId: ctx.session.user.id, teamId },
      });

      if (!userTeamMember || userTeamMember.role !== "LEADER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to view team stats",
        });
      }
      const team = await ctx.db.team.findUnique({
        where: { id: teamId },
        include: { teamMembers: true },
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      const memberCount = team.teamMembers.length;
      const completedSurveys = team.teamMembers.filter(
        (member) => member.status === "COMPLETED",
      ).length;
      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(team.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      return {
        memberCount,
        completedSurveys,
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

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
