import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Resend } from "resend";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { InviteMemberEmailTemplate } from "~/server/emails/InviteMember";
import { env } from "~/env";
import { randomBytes } from "crypto";
import { calculateResult } from "~/lib/calculateResult";
import { getLocale } from "next-intl/server";

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

      // Check if removing this member would result in fewer than 5 total members
      const currentMemberCount = await ctx.db.invite.count({
        where: { teamId: invite.teamId },
      });

      if (currentMemberCount <= 5) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove member. Team must have exactly 5 members.",
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

      const locale = await getLocale();

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

      // Count current team members (excluding the leader)
      const memberCount = team.invitations.filter(
        (invite) => invite.userId !== team.ownerId,
      ).length;

      // Check if team already has exactly 5 members (owner + 4 invitations)
      const currentTotalMembers = team.invitations.length;
      if (currentTotalMembers > 5) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Team already has the maximum of 5 members",
        });
      }

      // Only send email invitations once we have at least 5 team members
      const shouldSendEmail = memberCount >= 4; // Will be 5 after creating this invite

      if (shouldSendEmail) {
        const url = `${env.BASE_URL}/${locale}/survey/${token}`;

        const { error } = await resend.emails.send({
          from: env.EMAIL_FROM,
          to: [input.email],
          subject: "Invitation to MindClip",
          react: await InviteMemberEmailTemplate({
            inviterName: ctx.session.user.email ?? undefined,
            url,
          }),
        });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send invite",
          });
        }

        // If this is the 5th member, send emails to all previous members too

        const pendingInvites = team.invitations.filter(
          (invite) =>
            invite.userId !== team.ownerId && invite.status === "PENDING",
        );

        for (const pendingInvite of pendingInvites) {
          const pendingUrl = `${env.BASE_URL}/${locale}/survey/${pendingInvite.inviteToken}`;

          await resend.emails.send({
            from: env.EMAIL_FROM,
            to: [pendingInvite.email],
            subject: "Invitation to MindClip",
            react: await InviteMemberEmailTemplate({
              inviterName: ctx.session.user.email ?? undefined,
              url: pendingUrl,
            }),
          });
        }
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
      const locale = await getLocale();

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

      const url = `${env.BASE_URL}/${locale}/survey/${invite.inviteToken!}`;

      const { error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to: [invite.email],
        subject: "Invitation to MindClip",
        react: await InviteMemberEmailTemplate({
          inviterName: ctx.session.user.email ?? undefined,
          url,
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

      // Get current user's invite for resultsReleased check
      const userInvite = invites.find(
        (invite) => invite.userId === ctx.session.user.id,
      );

      if (!isAllCompleted) {
        return {
          isAllCompleted: false,
          teamAverage: null,
          userResult: null,
          resultsReleased: team.resultsReleased || null,
        };
      }

      // Get all answers for team average
      const allAnswers = await ctx.db.answer.findMany({
        where: {
          invite: {
            teamId: input.teamId,
          },
        },
        include: {
          pair: true,
        },
      });

      // Get current user's answers
      const userAnswers = userInvite
        ? await ctx.db.answer.findMany({
            where: {
              inviteId: userInvite.id,
            },
            include: {
              pair: true,
            },
          })
        : [];

      const teamAverage =
        allAnswers.length > 0 ? calculateResult(allAnswers) : null;
      const userResult =
        userAnswers.length > 0 ? calculateResult(userAnswers) : null;

      return {
        isAllCompleted: true,
        teamAverage,
        userResult,
        resultsReleased: team?.resultsReleased || null,
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
