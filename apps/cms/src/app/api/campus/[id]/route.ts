import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const campus = await prisma.campus.findUnique({ where: { id } });
    const meta = await prisma.campus_meta.findUnique({ where: { id } });
    if (!campus) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, data: { ...campus, meta } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const campus = await prisma.campus.update({ where: { id }, data: { nombre: body.nombre } });
    const meta = await prisma.campus_meta.upsert({
      where: { id },
      create: { id, imagen: body.imagen ?? null, direccion: body.direccion ?? null, ciudad: body.ciudad ?? null, map_url: body.map_url ?? null },
      update: { imagen: body.imagen ?? null, direccion: body.direccion ?? null, ciudad: body.ciudad ?? null, map_url: body.map_url ?? null },
    });
    return NextResponse.json({ ok: true, data: { ...campus, meta } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.campus_meta.deleteMany({ where: { id } });
    await prisma.campus.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
