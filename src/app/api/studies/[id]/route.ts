import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { codigo, determinacion, urgencia, ref, ub, frecuencia } = body;

        const data: Record<string, string | number | boolean | null> = {};
        if (codigo !== undefined) data.codigo = Number(codigo);
        if (determinacion !== undefined) data.determinacion = String(determinacion);
        if (urgencia !== undefined) data.urgencia = Boolean(urgencia);
        if (ref !== undefined) data.ref = ref ? String(ref) : null;
        if (ub !== undefined) data.ub = Number(ub);
        if (frecuencia !== undefined) data.frecuencia = frecuencia ? String(frecuencia) : null;

        const study = await prisma.study.update({ where: { id }, data });
        return NextResponse.json(study);
    } catch (error) {
        console.error("PATCH /api/studies/:id Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.study.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/studies/:id Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
