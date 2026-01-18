"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

// --- Auth Actions ---

export async function registerUser(email: string, password: string, name: string) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: "En bruker med denne e-postadressen eksisterer allerede." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: "CUSTOMER"
            }
        });

        return { success: true, userId: user.id };
    } catch (error) {
        console.error("Error registering user:", error);
        return { error: "Kunne ikke registrere bruker." };
    }
}

export async function getUserEvents(userId: string) {
    try {
        const events = await prisma.event.findMany({
            where: {
                users: {
                    some: { id: userId }
                }
            },
            orderBy: { date: "asc" }
        });
        return { events };
    } catch (error) {
        console.error("Error fetching user events:", error);
        return { error: "Kunne ikke hente dine arrangementer." };
    }
}

// --- Event & Settings Actions ---

export async function createEvent(data: { name: string, type: "WEDDING" | "CHRISTENING" | "NAMING_CEREMONY" | "CONFIRMATION" | "JUBILEE" | "OTHER", date: Date, slug: string }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: "Du må være logget inn for å opprette et arrangement." };
        }

        const userId = (session.user as any).id;

        const event = await prisma.event.create({
            data: {
                name: data.name,
                type: data.type,
                date: data.date,
                slug: data.slug,
                users: {
                    connect: { id: userId }
                }
            }
        });
        revalidatePath("/admin");
        return { success: true, event };
    } catch (error) {
        console.error("Error creating event:", error);
        return { error: "Kunne ikke opprette arrangement. Kanskje nettadressen allerede er i bruk?" };
    }
}

export async function getEventBySlug(slug: string) {
    return await prisma.event.findUnique({
        where: { slug }
    });
}

// --- Wishlist Actions ---

export async function markAsPurchased(itemId: string, name: string = "En gjest") {
    try {
        await prisma.wishlistItem.update({
            where: { id: itemId },
            data: {
                isPurchased: true,
                purchasedBy: name,
            },
        });
        revalidatePath("/wishlist");
        return { success: true };
    } catch (error) {
        console.error("Error marking as purchased:", error);
        return { error: "Kunne ikke oppdatere ønske." };
    }
}

export async function addWishlistItem(eventId: string, title: string, description: string, imageUrl: string, link: string) {
    try {
        await prisma.wishlistItem.create({
            data: {
                eventId,
                title,
                description,
                imageUrl,
                link,
            },
        });
        revalidatePath("/wishlist");
        revalidatePath("/admin");
        revalidatePath("/admin/wishlist");
        return { success: true };
    } catch (error) {
        console.error("Error adding wishlist item:", error);
        return { error: "Kunne ikke legge til ønske." };
    }
}

export async function deleteWishlistItem(itemId: string) {
    try {
        await prisma.wishlistItem.delete({
            where: { id: itemId },
        });
        revalidatePath("/wishlist");
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting wishlist item:", error);
        return { error: "Kunne ikke slette ønske." };
    }
}

// --- Song Request Actions ---

export async function addSongRequest(eventId: string, title: string, artist: string, requestedBy: string) {
    try {
        await prisma.songRequest.create({
            data: {
                eventId,
                title,
                artist,
                requestedBy,
            },
        });
        revalidatePath("/playlist");
        return { success: true };
    } catch (error) {
        console.error("Error adding song request:", error);
        return { error: "Kunne ikke legge til sang." };
    }
}

// --- Guest & Partner Actions ---

async function managePartnerLinks(tx: any, guestId: string, newPartnerId: string | null) {
    const guest = await tx.guest.findUnique({ where: { id: guestId }, select: { partnerId: true } });
    const currentPartnerId = guest?.partnerId;

    if (currentPartnerId === newPartnerId) return;

    if (currentPartnerId) {
        const oldPartner = await tx.guest.findUnique({ where: { id: currentPartnerId }, select: { partnerId: true } });
        if (oldPartner?.partnerId === guestId) {
            await tx.guest.update({ where: { id: currentPartnerId }, data: { partnerId: null } });
        }
    }

    const incoming = await tx.guest.findUnique({ where: { partnerId: guestId } });
    if (incoming && incoming.id !== newPartnerId) {
        await tx.guest.update({ where: { id: incoming.id }, data: { partnerId: null } });
    }

    if (newPartnerId) {
        const newPartner = await tx.guest.findUnique({ where: { id: newPartnerId }, select: { partnerId: true } });
        if (newPartner?.partnerId) {
            await tx.guest.update({ where: { id: newPartner.partnerId }, data: { partnerId: null } });
        }
        const newPartnerIncoming = await tx.guest.findUnique({ where: { partnerId: newPartnerId } });
        if (newPartnerIncoming) {
            await tx.guest.update({ where: { id: newPartnerIncoming.id }, data: { partnerId: null } });
        }
        await tx.guest.update({ where: { id: newPartnerId }, data: { partnerId: guestId } });
        await tx.guest.update({ where: { id: guestId }, data: { partnerId: newPartnerId } });
    } else {
        await tx.guest.update({ where: { id: guestId }, data: { partnerId: null } });
    }
}

export async function addGuest(eventId: string, name: string, type: "DINNER" | "PARTY", allergies: string = "", rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED" = "PENDING", tableId: string | null = null, partnerId: string | null = null, mobile: string = "", address: string = "", role: string = "") {
    try {
        await prisma.$transaction(async (tx: any) => {
            const newGuest = await tx.guest.create({
                data: {
                    eventId,
                    name,
                    type,
                    allergies,
                    rsvpStatus,
                    mobile,
                    address,
                    role,
                    ...(tableId ? { table: { connect: { id: tableId } } } : {}),
                },
            });
            await managePartnerLinks(tx, newGuest.id, partnerId);
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        console.error("Error adding guest:", error);
        return { error: "Kunne ikke legge til gjest: " + error.message };
    }
}

export async function deleteGuest(guestId: string) {
    try {
        await prisma.$transaction(async (tx: any) => {
            await managePartnerLinks(tx, guestId, null);
            await tx.guest.delete({ where: { id: guestId } });
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting guest:", error);
        return { error: "Kunne ikke slette gjest." };
    }
}

export async function updateGuest(guestId: string, data: { name: string, type: "DINNER" | "PARTY", allergies: string, rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED", tableId?: string | null, partnerId?: string | null, mobile?: string, address?: string, role?: string }) {
    try {
        await prisma.$transaction(async (tx: any) => {
            const { partnerId, ...rest } = data;
            await tx.guest.update({
                where: { id: guestId },
                data: rest,
            });
            if (partnerId !== undefined) {
                await managePartnerLinks(tx, guestId, partnerId);
            }
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error updating guest:", error);
        return { error: "Kunne ikke oppdatere gjest." };
    }
}

export async function importGuests(eventId: string, rawData: string) {
    try {
        const lines = rawData.split(/\r?\n/).filter(line => line.trim() !== "");
        let addedCount = 0;

        await prisma.$transaction(async (tx: any) => {
            for (const line of lines) {
                const parts = line.split(/[;,\t]/).map(p => p.trim());
                if (parts.length === 0) continue;
                const name = parts[0];
                const mobile = parts[1] || "";
                const address = parts[2] || "";
                const role = parts[3] || "";

                await tx.guest.create({
                    data: {
                        eventId,
                        name,
                        type: "DINNER", // Default
                        mobile,
                        address,
                        role
                    }
                });
                addedCount++;
            }
        });

        revalidatePath("/admin");
        return { success: true, count: addedCount };
    } catch (error: any) {
        console.error("Error importing guests:", error);
        return { error: "Feil ved import: " + error.message };
    }
}

// --- Table Actions ---

export async function createTable(eventId: string, name: string, capacity: number = 8, shape: "ROUND" | "SQUARE" | "RECTANGLE" | "LONG" = "ROUND") {
    try {
        await prisma.table.create({
            data: { eventId, name, capacity, shape },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error creating table:", error);
        return { error: "Kunne ikke opprette bord." };
    }
}

export async function batchCreateTables(eventId: string, prefix: string, startNumber: number, count: number, capacity: number, shape: "ROUND" | "SQUARE" | "RECTANGLE" | "LONG") {
    try {
        const promises = [];
        for (let i = 0; i < count; i++) {
            const name = `${prefix} ${startNumber + i}`;
            promises.push(prisma.table.create({
                data: { eventId, name, capacity, shape },
            }));
        }
        await Promise.all(promises);
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error creating tables:", error);
        return { error: "Kunne ikke opprette bord. Sjekk om navnene er unike." };
    }
}

export async function deleteTable(tableId: string) {
    try {
        await prisma.table.delete({ where: { id: tableId } });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { error: "Kunne ikke slette bord." };
    }
}

export async function deleteTables(tableIds: string[]) {
    try {
        await prisma.$transaction(async (tx: any) => {
            await tx.guest.updateMany({
                where: { tableId: { in: tableIds } },
                data: { tableId: null }
            });
            await tx.table.deleteMany({
                where: { id: { in: tableIds } }
            });
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { error: "Kunne ikke slette bordene." };
    }
}

export async function updateTable(tableId: string, data: any) {
    try {
        await prisma.table.update({
            where: { id: tableId },
            data: data,
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { error: "Kunne ikke oppdatere bord: " + error.message };
    }
}

// --- Budget Actions ---

export async function createBudgetItem(eventId: string, description: string, category: string, estimatedCost: number) {
    try {
        await prisma.budgetItem.create({
            data: {
                eventId,
                description,
                category,
                estimatedCost
            }
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { error: "Kunne ikke opprette budsjettpost." };
    }
}

export async function updateBudgetItem(itemId: string, data: { description?: string, estimatedCost?: number, actualCost?: number, isPaid?: boolean }) {
    try {
        await prisma.budgetItem.update({
            where: { id: itemId },
            data
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { error: "Kunne ikke oppdatere budsjettpost." };
    }
}

// --- Gallery Actions ---

export async function addGalleryItem(eventId: string, url: string, caption: string = "", source: "UPLOAD" | "INSTAGRAM" = "UPLOAD", externalId: string | null = null) {
    try {
        const item = await prisma.galleryItem.create({
            data: {
                eventId,
                url,
                caption,
                source,
                externalId
            }
        });
        revalidatePath("/gallery");
        revalidatePath("/admin/gallery");
        return { success: true, item };
    } catch (error) {
        console.error("Error adding gallery item:", error);
        return { error: "Kunne ikke legge til bilde." };
    }
}

export async function deleteGalleryItem(itemId: string) {
    try {
        await prisma.galleryItem.delete({
            where: { id: itemId }
        });
        revalidatePath("/gallery");
        revalidatePath("/admin/gallery");
        return { success: true };
    } catch (error) {
        console.error("Error deleting gallery item:", error);
        return { error: "Kunne ikke slette bilde." };
    }
}

import { cookies } from "next/headers";

// --- Protection Actions ---

export async function verifyEventPassword(eventId: string, password: string) {
    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { guestPassword: true }
        });

        if (!event || !event.guestPassword) {
            return { success: true }; // No password needed
        }

        if (event.guestPassword === password) {
            const cookieStore = await cookies();
            cookieStore.set(`event_auth_${eventId}`, "true", {
                maxAge: 60 * 60 * 24 * 7, // 1 week
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax"
            });
            return { success: true };
        }

        return { error: "Feil passord." };
    } catch (error) {
        return { error: "Noe gikk galt." };
    }
}

export async function checkEventAuth(eventId: string) {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { guestPassword: true }
    });

    if (!event || !event.guestPassword) return true;

    const cookieStore = await cookies();
    return cookieStore.has(`event_auth_${eventId}`);
}

export async function updateEventSettings(eventId: string, data: { name?: string, date?: Date, guestPassword?: string | null, config?: any }) {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Ikke autorisert" };

        await prisma.event.update({
            where: { id: eventId },
            data
        });
        revalidatePath("/admin");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Kunne ikke oppdatere innstillinger." };
    }
}

export async function deleteBudgetItem(itemId: string) {
    try {
        await prisma.budgetItem.delete({ where: { id: itemId } });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { error: "Kunne ikke slette budsjettpost." };
    }
}

export async function addAdminToEvent(eventId: string, email: string) {
    try {
        const adminSession = await auth();
        if (!adminSession?.user) return { error: "Ikke autorisert" };

        const userToAdd = await prisma.user.findUnique({
            where: { email }
        });

        if (!userToAdd) {
            return { error: "Fant ingen bruker med denne e-postadressen." };
        }

        await prisma.event.update({
            where: { id: eventId },
            data: {
                users: {
                    connect: { id: userToAdd.id }
                }
            }
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error adding admin:", error);
        return { error: "Kunne ikke legge til administrator." };
    }
}


