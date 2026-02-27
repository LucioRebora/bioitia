import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") ?? "";
        const query = `%${q}%`;

        // Usamos queryRaw para poder castear el código numérico a texto y buscar parcialmente
        const studies = await prisma.$queryRaw`
            SELECT * FROM "Study"
            WHERE "determinacion" ILIKE ${query}
               OR "frecuencia" ILIKE ${query}
               OR CAST("codigo" AS TEXT) LIKE ${query}
            ORDER BY "codigo" ASC
        `;

        return NextResponse.json(studies);
    } catch (error) {
        console.error("GET /api/studies Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { codigo, determinacion, urgencia, ref, ub, frecuencia } = body;

        const study = await prisma.study.create({
            data: {
                codigo: Number(codigo),
                determinacion: String(determinacion),
                urgencia: Boolean(urgencia),
                ref: ref ? String(ref) : null,
                ub: Number(ub),
                frecuencia: frecuencia ? String(frecuencia) : null,
            },
        });

        return NextResponse.json(study, { status: 201 });
    } catch (error) {
        console.error("POST /api/studies Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
