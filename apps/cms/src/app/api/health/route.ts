import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const facultadCount = await prisma.facultad.count();
    const campusCount = await prisma.campus.count();
    const carreraCount = await prisma.carrera.count();
    
    return NextResponse.json({ 
      ok: true, 
      ping: true,
      counts: { 
        facultad: facultadCount, 
        campus: campusCount, 
        carrera: carreraCount 
      } 
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}


