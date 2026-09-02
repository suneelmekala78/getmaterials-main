import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB, User } from "@/lib/database";

const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL || "http://localhost:4000";

async function verifyPhoneOtp(credentials: Record<string, unknown>) {
  const phone = credentials.phone as string;
  const code = credentials.code as string;

  const res = await fetch(`${API_INTERNAL_URL}/api/auth/phone/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase(),
        }).select("+password");

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        if (!user.emailVerified && !user.phoneVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          status: user.status,
        };
      },
    }),
    Credentials({
      id: "phone",
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        code: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) return null;

        const user = await verifyPhoneOtp(credentials as Record<string, unknown>);
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.status = (user as any).status;
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      if (token.id) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.id).select("role status").lean();
          if (!dbUser || (dbUser as any).status === "suspended") {
            return { ...token, error: "UserRevoked" };
          }
          token.role = (dbUser as any).role;
          token.status = (dbUser as any).status;
        } catch {
          // DB unavailable — keep user logged in with last known state
        }
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "UserRevoked") {
        return { ...session, expires: new Date(0).toISOString() } as any;
      }
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60,
  },
  trustHost: true,
  cookies: {
    sessionToken: {
      name: "getmaterials-main-session",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "getmaterials-main-csrf",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});
