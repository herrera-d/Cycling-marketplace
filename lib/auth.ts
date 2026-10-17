import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import {
  accounts,
  getDb,
  sessions,
  users,
  verificationTokens,
} from "@/db";

/**
 * Configuración central de Auth.js (NextAuth v5) — Fase 2.
 *
 * Estrategia de sesión **JWT**: el adaptador de Drizzle sigue persistiendo
 * usuarios y cuentas (`users`, `accounts`), pero la sesión viaja cifrada en
 * una cookie. Esto permite hacer comprobaciones "optimistas" desde `proxy.ts`
 * sin tocar la base de datos en cada request (recomendado por Next.js).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  // Necesario para confiar en el host en local y tras proxies (Vercel).
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // Propaga el id del usuario (uuid de Neon) hacia el token y la sesión.
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
