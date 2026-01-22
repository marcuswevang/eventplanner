import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
    providers: [],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.sub;
            }
            return session;
        },
    },
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
};
