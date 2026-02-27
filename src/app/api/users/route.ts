import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const USER_SELECT = {
    id: true,
    email: true,
    name: true,
    role: true,
    active: true,
    createdAt: true,
} as const;

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: USER_SELECT,
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error("Users GET Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, role, password } = body;

        const hashed = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { email, name, role: role || "USER", password: hashed },
            select: USER_SELECT,
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("Users POST Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
