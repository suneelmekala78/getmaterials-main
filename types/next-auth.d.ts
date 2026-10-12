import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    status?: string;
    accessToken?: string;
  }

  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: string;
      status?: string;
      isNewUser?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    status?: string;
    accessToken?: string;
    accessTokenExpires?: number;
    newUserAt?: number;
    error?: string;
  }
}
