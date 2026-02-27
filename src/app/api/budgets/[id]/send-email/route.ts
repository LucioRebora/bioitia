import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBudgetEmail } from "@/lib/mailer";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Obtener el presupuesto con sus items y el nombre del plan base
        const [budget]: any = await prisma.$queryRaw`
            SELECT 
                b."id", 
                b."paciente", 
                b."telefono", 
                b."email", 
                b."total", 
                b."createdAt",
                p."nombre" as "planNombre"
            FROM "Budget" b
            LEFT JOIN "Plan" p ON b."planId" = p.id
            WHERE b.id = ${id}
            LIMIT 1
        `;

        if (!budget) {
            return NextResponse.json({ error: "No encontrado" }, { status: 404 });
        }

        if (!budget.email) {
            return NextResponse.json({ error: "El presupuesto no tiene un email asociado" }, { status: 400 });
        }

        const items: any[] = await prisma.$queryRaw`
            SELECT * FROM "BudgetItem" WHERE "budgetId" = ${id}
        `;

        // Enviar el email
        await sendBudgetEmail({ ...budget, items });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("POST /api/budgets/[id]/send-email Error:", error);
        return NextResponse.json({ error: error.message || "Error al enviar el email" }, { status: 500 });
    }
}
