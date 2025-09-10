import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.carrera.findMany({ orderBy: { nombre: 'asc' } });
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.carrera.create({ data: {
      id: body.id,
      nombre: body.nombre,
      facultad_id: body.facultad_id,
      duracion: body.duracion ?? null,
      grado: body.grado ?? null,
      titulo: body.titulo ?? null,
      imagen: body.imagen ?? null,
    }});
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
