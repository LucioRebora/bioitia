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

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, email, role, password, active } = body;

        const data: Record<string, string | boolean> = {};
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (role !== undefined) data.role = role;
        if (active !== undefined) data.active = Boolean(active);
        if (password && String(password).length > 0) {
            data.password = await bcrypt.hash(password, 12);
        }

        const user = await prisma.user.update({
            where: { id },
            data,
            select: USER_SELECT,
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("PATCH /api/users/:id Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/users/:id Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
