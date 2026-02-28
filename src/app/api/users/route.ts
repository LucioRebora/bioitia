import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const whereClause = session.user.role === "ADMIN" ? {} : { laboratoryId: session.user.laboratoryId };

        const users = await prisma.user.findMany({
            where: whereClause as any,
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
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { email, name, role, password, laboratoryId } = body;

        // Use the user's laboratoryId unless they are ADMIN specifying one
        const assignedLaboratoryId = session.user.role === "ADMIN" && laboratoryId
            ? laboratoryId
            : session.user.laboratoryId;

        const hashed = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { email, name, role: role || "USER", password: hashed, laboratoryId: assignedLaboratoryId } as any,
            select: USER_SELECT,
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("Users POST Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
