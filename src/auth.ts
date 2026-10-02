import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getAdminAccount } from "@/lib/auth-accounts";

// Öffentlich bekannter Beispiel-Hash aus der bcrypt-Dokumentation (Hash von
// "password") — dient nur als Vergleichsziel, wenn keine E-Mail passt, damit
// bcrypt.compare() immer läuft. Der Klartext ist irrelevant, da dieser Zweig
// ohnehin nie zu einem erfolgreichen Login führt.
const DUMMY_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        // "admin" = der eine, vom Kunden selbst unter /admin/register
        // angelegte Account (DB-Singleton, s. auth-accounts.ts) — eingeschränkte
        // Rolle ohne Design. "webdev" = genau 2 fest verdrahtete Bierpapa-
        // Accounts (Env-Var-Hash, nicht registrierbar) mit voller Developer-
        // Rolle (zusätzlich Design), Login über den versteckten Pfad
        // /bierp4a4/login.
        const admin = await getAdminAccount();
        const accounts = [
          {
            id: "admin",
            name: "Admin",
            role: "admin" as const,
            email: admin?.email,
            hash: admin?.passwordHash,
          },
          {
            id: "webdev-1",
            name: "Webdev",
            role: "developer" as const,
            email: process.env.WEBDEV1_EMAIL,
            hash: process.env.WEBDEV1_PASSWORD_HASH,
          },
          {
            id: "webdev-2",
            name: "Webdev",
            role: "developer" as const,
            email: process.env.WEBDEV2_EMAIL,
            hash: process.env.WEBDEV2_PASSWORD_HASH,
          },
        ];

        // bcrypt.compare läuft bewusst IMMER genau einmal, auch wenn keine
        // E-Mail passt: ein `continue` vor dem bcrypt-Aufruf bei falscher
        // E-Mail wäre spürbar schneller als bei falschem Passwort (bcrypt ist
        // absichtlich langsam) und würde per Timing-Angriff verraten, welche
        // E-Mail-Adressen überhaupt gültige Accounts sind.
        const match = accounts.find(
          (a) => a.email && a.hash && email.toLowerCase() === a.email.toLowerCase(),
        );
        const ok = await bcrypt.compare(password, match?.hash ?? DUMMY_HASH);
        if (match?.hash && ok) {
          return { id: match.id, email: match.email!, name: match.name, role: match.role };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
});
