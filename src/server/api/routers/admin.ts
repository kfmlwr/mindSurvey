import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { calculateResult } from "~/lib/calculateResult";

const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .min(2, "Team name must be at least 2 characters")
    .max(50, "Team name must be less than 50 characters"),
  ownerEmail: z
    .string()
    .min(1, "Owner email is required")
    .email("Please enter a valid email address"),
  members: z
    .array(
      z.object({
        email: z
          .string()
          .min(1, "Member email is required")
          .email("Please enter a valid email address"),
      }),
    )
    .min(5, "At least 5 team members are required (in addition to the owner)")
    .refine(
      (members) => {
        const emails = members.map((m) => m.email.toLowerCase());
        const uniqueEmails = new Set(emails);
        return uniqueEmails.size === emails.length;
      },
      { message: "All member emails must be unique" },
    ),
});

const requireAdmin = (ctx: any) => {
  if (ctx.session?.user?.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
};

export const adminRouter = createTRPCRouter({
  // Create a new team
  createTeam: protectedProcedure
    .input(createTeamSchema)
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      // Validate that owner email is not in members list
      const allEmails = [
        input.ownerEmail,
        ...input.members.map((m) => m.email),
      ];
      const uniqueEmails = new Set(allEmails.map((e) => e.toLowerCase()));

      if (uniqueEmails.size !== allEmails.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Owner email must be unique from all member emails",
        });
      }

      // Check if owner user exists, if not create one
      let ownerUser = await ctx.db.user.findUnique({
        where: { email: input.ownerEmail },
      });

      if (!ownerUser) {
        ownerUser = await ctx.db.user.create({
          data: {
            email: input.ownerEmail,
            name: input.ownerEmail.split("@")[0],
          },
        });
      }

      // Create the team
      const team = await ctx.db.team.create({
        data: {
          name: input.name,
          ownerId: ownerUser.id,
        },
      });

      // Create owner invite
      await ctx.db.invite.create({
        data: {
          email: ownerUser.email ?? input.ownerEmail,
          teamId: team.id,
          userId: ownerUser.id,
          inviteToken: randomBytes(64).toString("hex"),
        },
      });

      // Process members: create users if they don't exist and create invites
      const memberInvites = [];

      for (const memberData of input.members) {
        // Skip empty emails
        if (!memberData.email.trim()) continue;

        let memberUser = await ctx.db.user.findUnique({
          where: { email: memberData.email },
        });

        if (!memberUser) {
          memberUser = await ctx.db.user.create({
            data: {
              email: memberData.email,
              name: memberData.email.split("@")[0],
            },
          });
        }

        const invite = await ctx.db.invite.create({
          data: {
            email: memberUser.email ?? memberData.email,
            teamId: team.id,
            userId: memberUser.id,
            inviteToken: randomBytes(64).toString("hex"),
          },
        });

        memberInvites.push(invite);
      }

      return {
        id: team.id,
        name: team.name,
        createdAt: team.createdAt,
        owner: {
          id: ownerUser.id,
          name: ownerUser.name,
          email: ownerUser.email,
        },
        memberCount: memberInvites.length + 1, // +1 for owner
      };
    }),

  // Get all teams for admin view
  getAllTeams: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx);

    const teams = await ctx.db.team.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            invitations: true,
          },
        },
        invitations: {
          select: {
            id: true,
            status: true,
            resultsReleased: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      owner: team.owner,
      memberCount: team._count.invitations,
      completedSurveys: team.invitations.filter(
        (invite) => invite.status === "COMPLETED",
      ).length,
      releasedResults: team.invitations.filter(
        (invite) => invite.resultsReleased !== null,
      ).length,
    }));
  }),

  // Release results for a specific team member
  releaseResults: protectedProcedure
    .input(
      z.object({
        inviteId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
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

      // Update the invite to release results
      await ctx.db.invite.update({
        where: { id: input.inviteId },
        data: {
          resultsReleased: new Date(),
          resultsReleasedById: ctx.session.user.id,
        },
      });

      return { success: true };
    }),

  // Release results for all members of a team
  releaseTeamResults: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
        include: { invitations: true },
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      // Update all completed invites to release results
      await ctx.db.invite.updateMany({
        where: {
          teamId: input.teamId,
          status: "COMPLETED",
        },
        data: {
          resultsReleased: new Date(),
          resultsReleasedById: ctx.session.user.id,
        },
      });

      return { success: true };
    }),

  // Get detailed team information
  getTeamDetails: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          invitations: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      return team;
    }),

  // Delete a team and all associated data
  deleteTeam: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);

      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
        include: {
          invitations: true,
        },
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      // Delete all answers for this team's invites first
      await ctx.db.answer.deleteMany({
        where: {
          invite: {
            teamId: input.teamId,
          },
        },
      });

      // Delete all invites for this team
      await ctx.db.invite.deleteMany({
        where: {
          teamId: input.teamId,
        },
      });

      // Finally delete the team
      await ctx.db.team.delete({
        where: { id: input.teamId },
      });

      return { success: true };
    }),

  // Get team results for admin view (similar to team.getTeamResults but without ownership check)
  getTeamResults: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx);

      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
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
          teamAverage: null,
          userResult: null,
          resultsReleased: null,
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

      const teamAverage =
        allAnswers.length > 0 ? calculateResult(allAnswers) : null;

      // Check if any results have been released (for display purposes)
      const hasReleasedResults = invites.some(
        (invite) => invite.resultsReleased !== null,
      );

      return {
        isAllCompleted: true,
        teamAverage,
        userResult: null, // Don't show individual results in admin view
        resultsReleased: hasReleasedResults ? new Date() : null,
      };
    }),
});
