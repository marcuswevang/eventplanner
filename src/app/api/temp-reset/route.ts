
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const email = "events@noker.se";
        const newPassword = "password123";
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true, email: user.email });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
