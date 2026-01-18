
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const email = "events@noker.se";
        const newPassword = "password123";
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Try raw SQL to bypass potential Prisma Client mismatch
        const result = await prisma.$executeRaw`
            UPDATE "User" 
            SET "password" = ${hashedPassword}, "isActivated" = true, "role" = 'SUPER_ADMIN'::"UserRole"
            WHERE "email" = ${email}
        `;

        // If no rows updated, we might need to insert (not doing that yet, assuming user exists from previous steps)
        if (result === 0) {
            // Create if not exists (raw insert is harder due to CUID generation and date handling, but let's try just updating first as user claimed to try logging in)
            return NextResponse.json({ error: "User not found to update" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            updatedRows: Number(result)
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 200 });
    }
}
