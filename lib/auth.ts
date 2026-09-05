import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB, User } from "@/lib/database";
import { resolveApiOrigin } from "@/lib/api-origin";

if (!process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET;
}
if (!process.env.AUTH_URL && process.env.NEXTAUTH_URL) {
  process.env.AUTH_URL = process.env.NEXTAUTH_URL;
}
if (!process.env.JWT_SECRET && (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)) {
  process.env.JWT_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
}

// Phone OTP login — disabled until SMS provider is ready.
// import { resolveApiOrigin } from "@/lib/api-origin";
// const API_INTERNAL_URL = resolveApiOrigin();

// Phone OTP login — disabled until SMS provider is ready.
// async function verifyPhoneOtp(credentials: Record<string, unknown>) {
//   const phone = credentials.phone as string;
//   const code = credentials.code as string;
//   const res = await fetch(`${API_INTERNAL_URL}/api/auth/phone/verify`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ phone, code }),
//   });
//   if (!res.ok) return null;
//   const data = await res.json();
//   return data.user ?? null;
// }

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
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

        const deletionAt = (user as any).deletionRequestedAt as Date | undefined;
        if (deletionAt) {
          const due = new Date(deletionAt).getTime() + 7 * 24 * 60 * 60 * 1000;
          if (Date.now() >= due) {
            await User.findByIdAndDelete(user._id);
            throw new Error("ACCOUNT_DELETED");
          }
          await User.updateOne(
            { _id: user._id },
            { $unset: { deletionRequestedAt: 1, deletionReason: 1 } },
          );
        }

        if (!user.emailVerified && !user.phoneVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        let accessToken: string | undefined;
        try {
          const tokenRes = await fetch(`${resolveApiOrigin()}/api/auth/web-session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          const tokenData = await tokenRes.json().catch(() => null);
          if (tokenRes.ok && tokenData?.accessToken) {
            accessToken = tokenData.accessToken;
          }
        } catch (error) {
          console.error("[website-auth] web-session token failed", error);
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar,
          slug: (user as any).slug,
          role: user.role,
          status: user.status,
          accessToken,
        };
      },
    }),
    // Phone OTP login — disabled until SMS provider is ready.
    // Credentials({
    //   id: "phone",
    //   name: "Phone",
    //   credentials: {
    //     phone: { label: "Phone", type: "tel" },
    //     code: { label: "OTP", type: "text" },
    //   },
    //   async authorize(credentials) {
    //     if (!credentials?.phone || !credentials?.code) return null;
    //     const user = await verifyPhoneOtp(credentials as Record<string, unknown>);
    //     if (!user) return null;
    //     return {
    //       id: user.id,
    //       email: user.email,
    //       name: user.name,
    //       image: user.avatar,
    //       role: user.role,
    //       status: user.status,
    //     };
    //   },
    // }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.status = (user as any).status;
        token.accessToken = (user as any).accessToken;
        token.slug = (user as any).slug;
        token.picture = (user as any).image || token.picture;
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
      }
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        if (typeof session.email === "string") token.email = session.email;
        if (typeof session.image === "string") token.picture = session.image;
        if (typeof (session as any).slug === "string") token.slug = (session as any).slug;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      if (token.id) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.id).select("role status avatar slug name").lean();
          if (!dbUser || (dbUser as any).status === "suspended") {
            return { ...token, error: "UserRevoked" };
          }
          token.role = (dbUser as any).role;
          token.status = (dbUser as any).status;
          token.picture = (dbUser as any).avatar || "";
          if ((dbUser as any).slug) token.slug = (dbUser as any).slug;
          if ((dbUser as any).name) token.name = (dbUser as any).name;
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
      return {
        ...session,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          id: String(token.id || token.sub || ""),
          slug: token.slug,
          role: token.role,
          status: token.status,
        },
      };
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
