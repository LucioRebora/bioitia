import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { nombre, nbu } = body;

        // Actualización dinámica con Raw SQL
        await prisma.$executeRaw`
            UPDATE "Plan"
            SET "nombre" = COALESCE(${nombre}, "nombre"),
                "nbu" = COALESCE(${nbu !== undefined ? Number(nbu) : null}, "nbu"),
                "updatedAt" = NOW()
            WHERE "id" = ${id}
        `;

        const [plan]: any = await prisma.$queryRaw`
            SELECT * FROM "Plan" WHERE "id" = ${id} LIMIT 1
        `;

        return NextResponse.json(plan);
    } catch (error) {
        console.error("PATCH /api/plans/[id] Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.$executeRaw`
            DELETE FROM "Plan" WHERE "id" = ${id}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/plans/[id] Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
