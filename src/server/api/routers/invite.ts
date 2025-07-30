import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

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

  getLeaderInvite: protectedProcedure.query(async ({ ctx }) => {
    const invite = await ctx.db.invite.findFirst({
      where: { userId: ctx.session.user.id },
    });
    if (!invite) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invite not found",
      });
    }
    return invite;
  }),
});
