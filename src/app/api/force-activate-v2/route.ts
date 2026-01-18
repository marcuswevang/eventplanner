
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const email = "events@noker.se";
        const newPassword = "password123";
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Try raw SQL
        const result = await prisma.$executeRaw`
            UPDATE "User" 
            SET "password" = ${hashedPassword}, "isActivated" = true, "role" = 'SUPER_ADMIN'::"UserRole"
            WHERE "email" = ${email}
        `;

        if (result === 0) {
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
