import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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

        // "admin" = eingeschränkte Admin-Rolle (nur Wohnungen/Einstellungen/
        // Posteingang), "webdev" = Developer-Rolle mit vollem Zugriff
        // (zusätzlich Design), Login über den versteckten Pfad /bierp4a4/login.
        const accounts = [
          {
            id: "admin",
            name: "Admin",
            role: "admin" as const,
            email: process.env.ADMIN_EMAIL,
            hash: process.env.ADMIN_PASSWORD_HASH,
          },
          {
            id: "webdev",
            name: "Webdev",
            role: "developer" as const,
            email: process.env.WEBDEV_EMAIL,
            hash: process.env.WEBDEV_PASSWORD_HASH,
          },
        ];

        for (const account of accounts) {
          if (!account.email || !account.hash) continue;
          if (email.toLowerCase() !== account.email.toLowerCase()) continue;
          if (await bcrypt.compare(password, account.hash)) {
            return { id: account.id, email: account.email, name: account.name, role: account.role };
          }
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
