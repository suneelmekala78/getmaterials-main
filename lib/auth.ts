import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB, User } from "@getmaterials/database";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
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

        // Reject unverified email users
        if (!user.emailVerified) {
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
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const newUser = await User.create({
            email: user.email,
            name: user.name,
            avatar: user.image,
            role: "student",
            status: "active",
            emailVerified: new Date(),
          });
          (user as any).id = newUser._id.toString();
          (user as any).role = "student";
          (user as any).status = "active";
        } else {
          if (existingUser.status === "suspended") return false;
          (user as any).id = existingUser._id.toString();
          (user as any).role = existingUser.role;
          (user as any).status = existingUser.status;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.status = (user as any).status;
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000; // 15 min
      }

      // Access token still valid — skip DB query for performance
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token expired — re-validate from DB (acts as "refresh")
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
    maxAge: 365 * 24 * 60 * 60, // 1 year (effectively infinite)
  },
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
  },
});
