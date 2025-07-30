import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Resend } from "resend";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { InviteMemberEmailTemplate } from "~/server/emails/InviteMember";
import { env } from "~/env";
import { randomBytes } from "crypto";
import { calculateResult } from "~/lib/calculateResult";

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

  listTeams: protectedProcedure.query(async ({ ctx }) => {
    const teams = await ctx.db.team.findMany({
      where: { ownerId: ctx.session.user.id },
      include: { _count: { select: { invitations: true } } },
    });
    return teams;
  }),

  createTeam: protectedProcedure
    .input(z.object({ name: z.string().min(1, "Name is required") }))
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      const team = await ctx.db.team.create({
        data: {
          name,
          ownerId: ctx.session.user.id,
        },
      });

      await ctx.db.invite.create({
        data: {
          email: ctx.session.user.email ?? "",
          teamId: team.id,
          userId: ctx.session.user.id,
          inviteToken: randomBytes(64).toString("hex"),
        },
      });

      return team;
    }),

  listAllInvites: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
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
          message: "You are not authorized to view this team's invites",
        });
      }

      const invites = await ctx.db.invite.findMany({
        where: { teamId: input.teamId },
      });

      return invites.filter((invite) => invite.userId !== ctx.session.user.id);
    }),

  removeInvite: protectedProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.invite.findUnique({
        where: { id: input.inviteId },
        include: { team: true },
      });
      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }
      if (invite.team.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to remove this invite",
        });
      }
      await ctx.db.invite.delete({
        where: { id: input.inviteId },
      });
      return { success: true };
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

      const team = await ctx.db.team.findUnique({
        where: { id: teamId },
        include: { invitations: true },
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
          message: "You are not authorized to invite members to this team",
        });
      }

      const existingInvite = team.invitations.find(
        (invite) => invite.email === email,
      );

      if (existingInvite) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }
      const token = randomBytes(64).toString("hex");

      const { error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to: [input.email],
        subject: "Invitation to MindClip",
        react: await InviteMemberEmailTemplate({
          inviterName: ctx.session.user.email ?? undefined,
          token: token,
        }),
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resend invite",
        });
      }

      const invite = await ctx.db.invite.create({
        data: {
          email,
          teamId,
          inviteToken: token,
        },
      });

      return invite;
    }),

  resendInvite: protectedProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.invite.findUnique({
        where: { id: input.inviteId },
        include: { team: true },
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      if (invite.team.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to resend this invite",
        });
      }

      const { error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to: [invite.email],
        subject: "Invitation to MindClip",
        react: await InviteMemberEmailTemplate({
          inviterName: ctx.session.user.email ?? undefined,
          token: invite.inviteToken!,
        }),
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resend invite",
        });
      }

      return { success: true };
    }),

  getTeamResults: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
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
          message: "You are not authorized to view this team's results",
        });
      }

      const invites = await ctx.db.invite.findMany({
        where: {
          teamId: input.teamId,
        },
      });

      const isAllCompleted = invites.every(
        (invite) => invite.status === "COMPLETED",
      );

      if (!isAllCompleted) {
        return {
          isAllCompleted: false,
          results: null,
        };
      }

      const answers = await ctx.db.answer.findMany({
        where: {
          invite: {
            teamId: input.teamId,
          },
        },
        include: {
          pair: true,
        },
      });

      const result = answers.length > 0 ? calculateResult(answers) : null;

      return {
        isAllCompleted: true,
        results: result,
      };
    }),

  getTeamMemberResults: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
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
          message: "You are not authorized to view this team's member results",
        });
      }

      const invites = await ctx.db.invite.findMany({
        where: {
          teamId: input.teamId,
          status: "COMPLETED",
        },
      });

      return invites;
    }),
});
