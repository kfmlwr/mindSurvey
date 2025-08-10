import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { signIn } from "~/server/auth";
import { AuthError } from "next-auth";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address"),
        locale: z.string().optional().default("en"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user exists and get their role
        const potentialUser = await ctx.db.user.findUnique({
          where: { email: input.email.toLowerCase() },
          select: { role: true },
        });

        const redirectTo =
          potentialUser?.role === "ADMIN"
            ? `/${input.locale}/admin/team`
            : `/${input.locale}/team`;

        // Single signIn call with appropriate redirect
        await signIn("resend", {
          email: input.email.toLowerCase(),
          redirectTo,
        });

        return { success: true };
      } catch (error) {
        // Handle expected redirect behavior from NextAuth
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
          return { success: true };
        }

        // Handle NextAuth specific errors
        if (error instanceof AuthError) {
          return { success: true };
        }

        // Log unexpected errors for debugging
        console.error("Login error:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Login failed",
        });
      }
    }),
});
