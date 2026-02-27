import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") ?? "";
        const query = `%${q}%`;

        const plans = await prisma.$queryRaw`
            SELECT * FROM "Plan"
            WHERE "nombre" ILIKE ${query}
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
        const body = await req.json();
        const { nombre, nbu } = body;

        if (!nombre || nbu === undefined) {
            return NextResponse.json({ error: "Nombre y NBU son requeridos" }, { status: 400 });
        }

        // Usamos executeRaw para insertar directamente en la tabla
        await prisma.$executeRaw`
            INSERT INTO "Plan" ("id", "nombre", "nbu", "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, ${nombre}, ${Number(nbu)}, NOW(), NOW())
        `;

        // Recuperamos el plan creado
        const [plan]: any = await prisma.$queryRaw`
            SELECT * FROM "Plan" WHERE "nombre" = ${nombre} LIMIT 1
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
