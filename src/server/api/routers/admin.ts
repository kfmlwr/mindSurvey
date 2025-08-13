import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { calculateResult } from "~/lib/calculateResult";
import { Resend } from "resend";
import { env } from "~/env";
import { ResultsReleasedEmailTemplate } from "~/server/emails/ResultsReleasedEmail";

const resend = new Resend(env.AUTH_RESEND_KEY);

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
          createdById: ctx.session.user.id,
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
        if (!memberData.email.trim()) continue;

        const invite = await ctx.db.invite.create({
          data: {
            email: memberData.email,
            teamId: team.id,
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
        tagsOnTeam: {
          select: {
            tag: {
              select: {
                id: true,
                label: true,
                color: true,
              },
            },
            assignedAt: true,
          },
        },
        invitations: {
          select: {
            id: true,
            status: true,
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
      isResultsReleased: team.resultsReleased !== null,
      memberCount: team._count.invitations,
      completedSurveys: team.invitations.filter(
        (invite) => invite.status === "COMPLETED",
      ).length,
      tags: team.tagsOnTeam.map((tag) => ({
        id: tag.tag.id,
        label: tag.tag.label,
        color: tag.tag.color,
        assignedAt: tag.assignedAt,
      })),
    }));
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
        include: {
          invitations: true,
          owner: true,
        },
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      // Update all completed invites to release results
      await ctx.db.team.update({
        where: { id: input.teamId },
        data: {
          resultsReleased: new Date(),
          resultsReleasedById: ctx.session.user.id,
        },
      });

      // Send email notification to team owner
      try {
        const teamResultsUrl = `${env.BASE_URL}/team/${input.teamId}`;

        await resend.emails.send({
          from: env.EMAIL_FROM,
          to: team.owner.email ?? "",
          subject: `Team Survey Results Released - ${team.name}`,
          react: ResultsReleasedEmailTemplate({
            teamName: team.name,
            teamOwnerName: team.owner.name ?? "Team Leader",
            url: teamResultsUrl,
          }) as any,
        });
      } catch (emailError) {
        console.error(
          "Failed to send team results released email:",
          emailError,
        );
        // Don't fail the mutation if email fails
      }

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

      return {
        isAllCompleted: isAllCompleted,
        teamAverage,
        userResult: null,
        resultsReleased: new Date(),
      };
    }),

  // User management endpoints

  // Get all users for admin view
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx);

    const users = await ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            teams: true,
            invite: true,
          },
        },
      },
      where: {
        role: "ADMIN",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ownedTeams: user._count.teams,
      invitations: user._count.invite,
    }));
  }),

  // Create a new admin user
  createAdmin: protectedProcedure
    .input(
      z.object({
        email: z
          .string()
          .min(1, "Email is required")
          .email("Please enter a valid email address"),
        name: z
          .string()
          .min(1, "Name is required")
          .min(2, "Name must be at least 2 characters")
          .max(100, "Name must be less than 100 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);

      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists",
        });
      }

      // Create the new admin user
      const newAdmin = await ctx.db.user.create({
        data: {
          email: input.email.toLowerCase(),
          name: input.name,
          role: "ADMIN",
        },
      });

      return {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt,
      };
    }),

  // Update user role
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["USER", "ADMIN"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);

      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Prevent admin from removing their own admin role
      if (user.id === ctx.session.user.id && input.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot remove your own admin role",
        });
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });

      return { success: true, user: updatedUser };
    }),

  // Update team details
  updateTeam: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        name: z
          .string()
          .min(1, "Team name is required")
          .min(2, "Team name must be at least 2 characters")
          .max(50, "Team name must be less than 50 characters"),
        ownerEmail: z
          .string()
          .min(1, "Owner email is required")
          .email("Please enter a valid email address"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);

      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
        include: {
          owner: true,
        },
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      // Check if new owner email is different from current owner
      let newOwnerId = team.ownerId;
      if (input.ownerEmail !== team.owner?.email) {
        // Find or create the new owner user
        let newOwner = await ctx.db.user.findUnique({
          where: { email: input.ownerEmail },
        });

        if (!newOwner) {
          newOwner = await ctx.db.user.create({
            data: {
              email: input.ownerEmail,
              name: input.ownerEmail.split("@")[0],
            },
          });
        }

        newOwnerId = newOwner.id;

        // Update the owner invite if it exists
        await ctx.db.invite.updateMany({
          where: {
            teamId: input.teamId,
            userId: team.ownerId,
          },
          data: {
            email: input.ownerEmail,
            userId: newOwner.id,
          },
        });
      }

      // Update the team
      const updatedTeam = await ctx.db.team.update({
        where: { id: input.teamId },
        data: {
          name: input.name,
          ownerId: newOwnerId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        id: updatedTeam.id,
        name: updatedTeam.name,
        updatedAt: updatedTeam.updatedAt,
        owner: updatedTeam.owner,
      };
    }),

  // Delete user (with safety checks)
  deleteUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);

      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          teams: true,
          invite: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Prevent admin from deleting themselves
      if (user.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot delete your own account",
        });
      }

      // Check if user owns teams
      if (user.teams.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Cannot delete user who owns teams. Transfer or delete teams first.",
        });
      }

      // Delete user invitations first
      await ctx.db.invite.deleteMany({
        where: { userId: input.userId },
      });

      // Delete the user
      await ctx.db.user.delete({
        where: { id: input.userId },
      });

      return { success: true };
    }),
});
