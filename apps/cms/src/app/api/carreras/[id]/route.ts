import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const carrera = await prisma.carrera.findUnique({ where: { id } });
    if (!carrera) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    const campus = await prisma.carrera_campus.findMany({ where: { carrera_id: id } });
    const modalidades = await prisma.carrera_modalidad.findMany({ where: { carrera_id: id } });
    const detalle = await prisma.carrera_detalle.findUnique({ where: { carrera_id: id } });
    return NextResponse.json({ ok: true, data: { carrera, campus, modalidades, detalle } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const carrera = await prisma.carrera.update({ where: { id }, data: {
      nombre: body.nombre,
      facultad_id: body.facultad_id,
      duracion: body.duracion ?? null,
      grado: body.grado ?? null,
      titulo: body.titulo ?? null,
      imagen: body.imagen ?? null,
    }});
    if (Array.isArray(body.campus)) {
      await prisma.carrera_campus.deleteMany({ where: { carrera_id: id } });
      await prisma.carrera_campus.createMany({ data: body.campus.map((c:string)=>({ carrera_id: id, campus_id: c })) });
    }
    if (Array.isArray(body.modalidades)) {
      await prisma.carrera_modalidad.deleteMany({ where: { carrera_id: id } });
      await prisma.carrera_modalidad.createMany({ data: body.modalidades.map((m:string)=>({ carrera_id: id, modalidad_id: m })) });
    }
    if (body.detalle) {
      await prisma.carrera_detalle.upsert({
        where: { carrera_id: id },
        create: { carrera_id: id, secciones: body.detalle.secciones ?? {} },
        update: { secciones: body.detalle.secciones ?? {} },
      });
    }
    return NextResponse.json({ ok: true, data: { carrera } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.carrera_detalle.deleteMany({ where: { carrera_id: id } });
    await prisma.carrera_campus.deleteMany({ where: { carrera_id: id } });
    await prisma.carrera_modalidad.deleteMany({ where: { carrera_id: id } });
    await prisma.carrera.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
