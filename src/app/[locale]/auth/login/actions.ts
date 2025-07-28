"use server";

import { AuthError } from "next-auth";
import { signIn } from "~/server/auth";

export async function loginAction(email: string) {
  try {
    await signIn("resend", { email });
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return { success: true };
    }

    if (error instanceof AuthError) {
      return { success: true };
    }

    return { success: false };
  }
}
