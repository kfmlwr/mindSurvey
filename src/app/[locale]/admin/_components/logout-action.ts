"use server";

import { signOut } from "~/server/auth";

export async function logoutAction() {
  await signOut({
    redirectTo: "/",
    redirect: true,
  });
}