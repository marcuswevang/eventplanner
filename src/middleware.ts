import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth((req) => {
    const isLoggedIn = !!req.auth;
    const userRole = (req.auth?.user as any)?.role;
    const isOnAdmin = req.nextUrl.pathname.startsWith("/admin");
    const isOnSuperadmin = req.nextUrl.pathname.startsWith("/superadmin");

    if (isOnSuperadmin) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", req.nextUrl));
        if (userRole !== "SUPER_ADMIN") return Response.redirect(new URL("/admin", req.nextUrl));
    }

    if (isOnAdmin && !isLoggedIn) {
        return Response.redirect(new URL("/login", req.nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
