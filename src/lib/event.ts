import { prisma } from "./prisma";
import { headers } from "next/headers";

export async function resolveEvent(slug?: string) {
    const host = (await headers()).get("host") || "";

    // 1. Try to find by custom domain
    if (host && !host.includes("localhost") && !host.includes("vercel.app")) {
        const event = await prisma.event.findUnique({
            where: { customDomain: host },
        });
        if (event) return event;
    }

    // 2. Try to find by slug
    if (slug) {
        const event = await prisma.event.findUnique({
            where: { slug },
        });
        if (event) return event;
    }

    // 3. Fallback to first event (for local dev/demo)
    return await prisma.event.findFirst();
}

export function isEventActive(event: any) {
    return event?.isActive !== false;
}
