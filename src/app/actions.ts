"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function addSongRequest(title: string, artist: string, requestedBy: string) {
    try {
        await prisma.songRequest.create({
            data: {
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

export async function addWishlistItem(title: string, description: string, imageUrl: string, link: string) {
    try {
        await prisma.wishlistItem.create({
            data: {
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

// Helper to manage partner links
async function managePartnerLinks(tx: any, guestId: string, newPartnerId: string | null) {
    // 1. Get current state of the guest
    const guest = await tx.guest.findUnique({ where: { id: guestId }, select: { partnerId: true } });
    const currentPartnerId = guest?.partnerId;

    // If no change, do nothing
    if (currentPartnerId === newPartnerId) return;

    // 2. Break old links if they exist
    // A. If guest was pointing to someone (OldPartner), clear OldPartner's link to Guest
    if (currentPartnerId) {
        // Check if OldPartner points back to Guest
        const oldPartner = await tx.guest.findUnique({ where: { id: currentPartnerId }, select: { partnerId: true } });
        if (oldPartner?.partnerId === guestId) {
            await tx.guest.update({ where: { id: currentPartnerId }, data: { partnerId: null } });
        }
    }

    // B. If someone was pointing to Guest (Incoming), clear Incoming's link
    const incoming = await tx.guest.findUnique({ where: { partnerId: guestId } });
    if (incoming && incoming.id !== newPartnerId) {
        await tx.guest.update({ where: { id: incoming.id }, data: { partnerId: null } });
    }

    // 3. Create new links
    if (newPartnerId) {
        // A. Break assignments of the NEW partner
        // If NewPartner points to someone (X), clear X's link to NewPartner?
        const newPartner = await tx.guest.findUnique({ where: { id: newPartnerId }, select: { partnerId: true } });
        if (newPartner?.partnerId) {
            // The person NewPartner WAS with (X) is now single. 
            // We unpoint X -> NewPartner.
            await tx.guest.update({ where: { id: newPartner.partnerId }, data: { partnerId: null } });
        }

        // Also checks if someone points to NewPartner? 
        const newPartnerIncoming = await tx.guest.findUnique({ where: { partnerId: newPartnerId } });
        if (newPartnerIncoming) {
            await tx.guest.update({ where: { id: newPartnerIncoming.id }, data: { partnerId: null } });
        }

        // B. Link NewPartner -> Guest
        await tx.guest.update({ where: { id: newPartnerId }, data: { partnerId: guestId } });

        // C. Link Guest -> NewPartner
        await tx.guest.update({ where: { id: guestId }, data: { partnerId: newPartnerId } });
    } else {
        // If setting to null, we just ensure Guest -> null
        await tx.guest.update({ where: { id: guestId }, data: { partnerId: null } });
    }
}

export async function addGuest(name: string, type: "DINNER" | "PARTY", allergies: string = "", rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED" = "PENDING", tableId: string | null = null, partnerId: string | null = null, mobile: string = "", address: string = "", role: string = "") {
    try {
        await prisma.$transaction(async (tx: any) => {
            // Build data object dynamically to avoid "Unknown argument" issues with nulls if that's the trigger
            // although scalar nulls should be fine.  Using exact optional properties.
            const guestData: any = {
                name,
                type,
                allergies,
                rsvpStatus,
                mobile,
                address,
                role
            };

            // Only add relation scalars if they have values or explicit null (checking strictness)
            // But to be safest: don't include them if null? 
            // In Prisma explicit `null` sets it to NULL.
            // "Unknown argument tableId" suggests the Type doesn't have `tableId`?
            // This happens if relation fields are misconfigured. But they look fine.
            // Let's TRY omitting them if null.
            if (tableId) guestData.tableId = tableId;
            // PartnerId is handled by managePartnerLinks separately anyway? No, it's passed here.
            // But managePartnerLinks does the heavy lifting.
            // Let's pass null for partnerId in create if not provided?
            // The DB has partnerId String? @unique.

            // NOTE: The error 'Unknown argument tableId' is very specific. 
            // It might be that in a 'create' context, Prisma 5+ sometimes prefers 'table: { connect: ... }' 
            // BUT scalar writes are standard.

            // Let's try to Force it to use the relation syntax if it hates the scalar one for some reason?
            // OR simply try 'undefined' instead of null?

            const newGuest = await tx.guest.create({
                data: {
                    name,
                    type,
                    allergies,
                    rsvpStatus,
                    mobile,
                    address,
                    role,
                    // If tableId is provided, try connecting. If null, ignore.
                    ...(tableId ? { table: { connect: { id: tableId } } } : {}),
                },
            });

            // Manage linking
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
            // Unlink partner if exists
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
            // Update basic fields first
            const { partnerId, ...rest } = data;
            await tx.guest.update({
                where: { id: guestId },
                data: rest,
            });

            // Update partner logic if partnerId is provided (or explicit null)
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

export async function importGuests(rawData: string) {
    try {
        const lines = rawData.split(/\r?\n/).filter(line => line.trim() !== "");
        let addedCount = 0;

        await prisma.$transaction(async (tx: any) => {
            for (const line of lines) {
                // Format: Name, Mobile, Address, Role
                // Support comma or tab or semicolon
                const parts = line.split(/[;,\t]/).map(p => p.trim());
                if (parts.length === 0) continue;

                const name = parts[0];
                const mobile = parts[1] || "";
                const address = parts[2] || "";
                const role = parts[3] || "";
                // Default to dinner for import? Or try to guees? Let's default to DINNER
                const type = "DINNER";

                // Basic create. We do NOT check duplicates here to keep it simple, 
                // but typically you might want to. 
                await tx.guest.create({
                    data: {
                        name,
                        type,
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

export async function createTable(name: string, capacity: number = 8, shape: string = "ROUND") {
    try {
        await prisma.table.create({
            data: { name, capacity, shape },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error creating table:", error);
        return { error: "Kunne ikke opprette bord. Navnet må være unikt." };
    }
}

export async function batchCreateTables(prefix: string, startNumber: number, count: number, capacity: number, shape: string) {
    try {
        const promises = [];
        for (let i = 0; i < count; i++) {
            const name = `${prefix} ${startNumber + i}`;
            promises.push(prisma.table.create({
                data: { name, capacity, shape },
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
        await prisma.table.delete({
            where: { id: tableId },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting table:", error);
        return { error: "Kunne ikke slette bord." };
    }
}

export async function deleteTables(tableIds: string[]) {
    try {
        // Must disconnect guests first or rely on cascade? 
        // Guests have tableId as optional, so we should set them to null.
        // Prisma Schema says: optional relation.
        // Let's explicitly set guests' tableId to null first to be safe.

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
        console.error("Error deleting tables:", error);
        return { error: "Kunne ikke slette bordene." };
    }
}

export async function updateTable(tableId: string, data: { name?: string, capacity?: number, shape?: string, x?: number, y?: number, rotation?: number, isLocked?: boolean }) {
    try {
        // explicitly build the update object to ensure type safety and no undefined values
        const updateData: any = {};

        if (typeof data.name === 'string') updateData.name = data.name;
        if (typeof data.capacity === 'number') updateData.capacity = data.capacity;
        if (typeof data.shape === 'string') updateData.shape = data.shape;

        // Ensure numbers are integers for Int fields
        if (typeof data.x === 'number' && !isNaN(data.x)) updateData.x = Math.round(data.x);
        if (typeof data.y === 'number' && !isNaN(data.y)) updateData.y = Math.round(data.y);
        if (typeof data.rotation === 'number' && !isNaN(data.rotation)) updateData.rotation = Math.round(data.rotation);

        if (typeof data.isLocked === 'boolean') updateData.isLocked = data.isLocked;

        if (Object.keys(updateData).length === 0) {
            return { success: true }; // Nothing to update
        }

        await prisma.table.update({
            where: { id: tableId },
            data: updateData,
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating table:", error);
        return { error: "Kunne ikke oppdatere bord: " + error.message };
    }
}
