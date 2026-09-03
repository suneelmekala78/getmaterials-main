import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    status?: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: string;
      status?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    status?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
