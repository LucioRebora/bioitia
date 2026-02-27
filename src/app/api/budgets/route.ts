import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") ?? "";
        const query = `%${q}%`;

        // Obtener presupuestos (planId es opcional en Budget)
        const budgets = await prisma.$queryRaw`
            SELECT 
                b."id", 
                b."paciente", 
                b."telefono", 
                b."email", 
                b."total", 
                b."planId", 
                b."sentAt",
                b."createdAt", 
                b."updatedAt",
                p."nombre" as "planNombre"
            FROM "Budget" b
            LEFT JOIN "Plan" p ON b."planId" = p.id
            WHERE b."paciente" ILIKE ${query} OR p."nombre" ILIKE ${query}
            ORDER BY b."createdAt" DESC
        `;

        return NextResponse.json(budgets);
    } catch (error) {
        console.error("GET /api/budgets Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { paciente, telefono, email, planId, total, items } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Se requieren items para el presupuesto" }, { status: 400 });
        }

        const budgetId = (await prisma.$queryRaw<any[]>`SELECT gen_random_uuid()::text as id`)[0].id;

        // Insert Budget
        await prisma.$executeRaw`
            INSERT INTO "Budget" ("id", "paciente", "telefono", "email", "total", "planId", "createdAt", "updatedAt")
            VALUES (${budgetId}, ${paciente || null}, ${telefono || null}, ${email || null}, ${Number(total)}, ${planId || null}, NOW(), NOW())
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
