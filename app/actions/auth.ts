"use server";

import { signOut } from "@/lib/auth";

/**
 * Cierra la sesión y vuelve al feed público.
 * Se usa como Server Action desde el menú de cuenta (`user-menu.tsx`).
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
