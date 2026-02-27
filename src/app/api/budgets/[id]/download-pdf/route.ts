import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBudgetPDF } from "@/lib/mailer";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Obtener el presupuesto con sus items y el nombre del plan base
        const budget: any = await prisma.$queryRaw`
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
        `.then((res: any) => res[0]);

        if (!budget) {
            return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
        }

        // Obtener los items del presupuesto
        const items = await prisma.$queryRaw`
            SELECT * FROM "BudgetItem" WHERE "budgetId" = ${id}
        `;
        budget.items = items;

        // Generar el PDF
        const pdfBuffer = await generateBudgetPDF(budget);

        // Crear una respuesta con el PDF
        return new Response(Buffer.from(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Presupuesto_${budget.paciente?.replace(/\s+/g, '_') || 'LB_Lab'}.pdf"`,
            },
        });
    } catch (error) {
        console.error("GET /api/budgets/[id]/download-pdf Error:", error);
        return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 });
    }
}
