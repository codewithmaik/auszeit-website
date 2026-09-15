import type { DefaultSession } from "next-auth";

export type AdminRole = "admin" | "developer";

declare module "next-auth" {
  interface User {
    role: AdminRole;
  }

  interface Session {
    user: {
      role: AdminRole;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: AdminRole;
  }
}
