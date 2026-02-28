import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") ?? "";
        const requestedLabId = searchParams.get("labId");
        const query = `%${q}%`;

        const isAdmin = session.user.role === "ADMIN";
        const targetLabId = (isAdmin && requestedLabId) ? requestedLabId : session.user.laboratoryId;

        if (!targetLabId) {
            return new NextResponse("Unauthorized / No laboratory selected", { status: 400 });
        }

        const plans = await prisma.$queryRaw`
            SELECT * FROM "Plan"
            WHERE "nombre" ILIKE ${query} AND "laboratoryId" = ${targetLabId}
            ORDER BY "nombre" ASC
        `;

        return NextResponse.json(plans);
    } catch (error) {
        console.error("GET /api/plans Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { nombre, nbu, labId } = body;

        const isAdmin = session.user.role === "ADMIN";
        const targetLabId = (isAdmin && labId) ? labId : session.user.laboratoryId;

        if (!targetLabId) {
            return new NextResponse("Unauthorized / Laboratory required", { status: 400 });
        }

        if (!nombre || nbu === undefined) {
            return NextResponse.json({ error: "Nombre y NBU son requeridos" }, { status: 400 });
        }

        // Usamos executeRaw para insertar directamente en la tabla
        await prisma.$executeRaw`
            INSERT INTO "Plan" ("id", "nombre", "nbu", "laboratoryId", "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, ${nombre}, ${Number(nbu)}, ${targetLabId}, NOW(), NOW())
        `;

        // Recuperamos el plan creado
        const [plan]: any = await prisma.$queryRaw`
            SELECT * FROM "Plan" WHERE "nombre" = ${nombre} AND "laboratoryId" = ${targetLabId} LIMIT 1
        `;

        return NextResponse.json(plan, { status: 201 });
    } catch (error) {
        console.error("POST /api/plans Error:", error);
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ error: "Ya existe un plan con ese nombre" }, { status: 400 });
        }
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
