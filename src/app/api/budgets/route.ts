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
        const date = searchParams.get("date") ?? "";
        const requestedLabId = searchParams.get("labId");
        const query = `%${q}%`;

        // Obtener presupuestos
        let budgets;

        const isAdmin = session.user.role === "ADMIN";
        const targetLabId = (isAdmin && requestedLabId) ? requestedLabId : session.user.laboratoryId;

        if (!targetLabId) {
            return new NextResponse("Unauthorized / No laboratory selected", { status: 400 });
        }

        const labFilter = `AND (b."laboratoryId" = '${targetLabId}')`;

        if (date) {
            budgets = await prisma.$queryRawUnsafe(`
                SELECT 
                    b."id", b."paciente", b."telefono", b."email", b."total", b."planId", b."sentAt", b."createdAt", b."updatedAt",
                    p."nombre" as "planNombre"
                FROM "Budget" b
                LEFT JOIN "Plan" p ON b."planId" = p.id
                WHERE (b."paciente" ILIKE $1 OR p."nombre" ILIKE $1)
                AND b."createdAt"::date = $2::date
                ${labFilter}
                ORDER BY b."createdAt" DESC
            `, query, date);
        } else {
            budgets = await prisma.$queryRawUnsafe(`
                SELECT 
                    b."id", b."paciente", b."telefono", b."email", b."total", b."planId", b."sentAt", b."createdAt", b."updatedAt",
                    p."nombre" as "planNombre"
                FROM "Budget" b
                LEFT JOIN "Plan" p ON b."planId" = p.id
                WHERE (b."paciente" ILIKE $1 OR p."nombre" ILIKE $1)
                ${labFilter}
                ORDER BY b."createdAt" DESC
            `, query);
        }

        return NextResponse.json(budgets);
    } catch (error) {
        console.error("GET /api/budgets Error:", error);
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
        const { paciente, telefono, email, planId, total, items, labId } = body;

        const isAdmin = session.user.role === "ADMIN";
        const targetLabId = (isAdmin && labId) ? labId : session.user.laboratoryId;

        if (!targetLabId) {
            return new NextResponse("Unauthorized / Laboratory required", { status: 400 });
        }

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Se requieren items para el presupuesto" }, { status: 400 });
        }

        const budgetId = (await prisma.$queryRaw<any[]>`SELECT gen_random_uuid()::text as id`)[0].id;

        // Insert Budget
        await prisma.$executeRaw`
            INSERT INTO "Budget" ("id", "paciente", "telefono", "email", "total", "planId", "laboratoryId", "createdAt", "updatedAt")
            VALUES (${budgetId}, ${paciente || null}, ${telefono || null}, ${email || null}, ${Number(total)}, ${planId || null}, ${targetLabId}, NOW(), NOW())
        `;

        // Insert Items with their specific planId and planNombre
        for (const item of items) {
            await prisma.$executeRaw`
                INSERT INTO "BudgetItem" ("id", "budgetId", "studyId", "planId", "planNombre", "codigo", "nombre", "ub", "valor")
                VALUES (gen_random_uuid()::text, ${budgetId}, ${item.studyId}, ${item.planId}, ${item.planNombre}, ${item.codigo}, ${item.nombre}, ${item.ub}, ${item.valor})
            `;
        }

        return NextResponse.json({ id: budgetId }, { status: 201 });
    } catch (error) {
        console.error("POST /api/budgets Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
