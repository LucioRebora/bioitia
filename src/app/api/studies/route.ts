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

        const studies = await prisma.$queryRaw`
            SELECT * FROM "Study"
            WHERE ("determinacion" ILIKE ${query}
               OR "frecuencia" ILIKE ${query}
               OR CAST("codigo" AS TEXT) LIKE ${query})
              AND "laboratoryId" = ${targetLabId}
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
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { codigo, determinacion, urgencia, ref, ub, frecuencia, labId } = body;

        const isAdmin = session.user.role === "ADMIN";
        const targetLabId = (isAdmin && labId) ? labId : session.user.laboratoryId;

        if (!targetLabId) {
            return new NextResponse("Unauthorized / Laboratory required", { status: 400 });
        }

        const study = await prisma.study.create({
            data: {
                codigo: Number(codigo),
                determinacion: String(determinacion),
                urgencia: Boolean(urgencia),
                ref: ref ? String(ref) : null,
                ub: Number(ub),
                frecuencia: frecuencia ? String(frecuencia) : null,
                laboratoryId: targetLabId,
            } as any,
        });

        return NextResponse.json(study, { status: 201 });
    } catch (error) {
        console.error("POST /api/studies Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
