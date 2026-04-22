import { UserRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  publicationSlug: string | null;
};

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    publicationSlug: string | null;
  }
}
