import { Response, Weight, type Language } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { calculateResult } from "~/lib/calculateResult";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const surveyRouter = createTRPCRouter({
  getAdjectives: publicProcedure
    .input(
      z.object({
        locale: z.string(),
        inviteToken: z.string(),
      }),
    )
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

      if (invite.status !== "PENDING") {
        await ctx.db.invite.update({
          where: { inviteToken: input.inviteToken },
          data: { status: "PENDING" },
        });
      }

      if (input.locale === "en") {
        const adjectives = await ctx.db.pairs.findMany({
          orderBy: { display_order: "asc" },
        });

        return adjectives.map((pair) => {
          return {
            id: pair.id,
            positive_adjective: pair.adjective_positive,
            negative_adjective: pair.adjective_negative,
            display_order: pair.display_order,
          };
        });
      }

      const language = input.locale.toUpperCase();

      const adjectives = await ctx.db.pairs.findMany({
        orderBy: { display_order: "asc" },
        include: {
          translation: {
            where: { language: language as Language },
          },
        },
      });

      if (adjectives.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No adjectives found",
        });
      }

      return adjectives.map((pair) => {
        return {
          id: pair.id,
          positive_adjective:
            pair.translation[0]?.adjective_positive ?? pair.adjective_positive,
          negative_adjective:
            pair.translation[0]?.adjective_negative ?? pair.adjective_negative,
          display_order: pair.display_order,
        };
      });
    }),

  submitSurvey: publicProcedure
    .input(
      z.object({
        inviteToken: z.string(),
        responses: z.array(
          z.object({
            adjectiveId: z.string(),
            response: z.nativeEnum(Response),
            weight: z.nativeEnum(Weight),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.invite.findUnique({
        where: { inviteToken: input.inviteToken },
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      if (invite.status !== "PENDING") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Survey already completed or not available",
        });
      }

      const responses = input.responses.map((response) => ({
        inviteId: invite.id,
        pairId: response.adjectiveId,
        response: response.response,
        weight: response.weight,
      }));

      await ctx.db.answer.createMany({ data: responses });

      const countAdjectives = await ctx.db.answer.count({
        where: { inviteId: invite.id },
      });

      const totalAdjectives = await ctx.db.pairs.count();

      if (countAdjectives >= totalAdjectives) {
        await ctx.db.invite.update({
          where: { id: invite.id },
          data: { status: "COMPLETED" },
        });
      } else {
        return {
          message: "Survey submitted, but not all adjectives were answered.",
        };
      }

      const answers = await ctx.db.answer.findMany({
        where: { inviteId: invite.id },
        include: {
          pair: true,
        },
      });

      const result = calculateResult(answers);

      return { result };
    }),
});
