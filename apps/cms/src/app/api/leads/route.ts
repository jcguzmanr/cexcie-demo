import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const leads = await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        l.id,
        l.nombre_completo,
        l.email,
        l.telefono,
        l.metodo_contacto,
        l.source,
        l.lead_id,
        l.created_at,
        COALESCE(
          (
            SELECT json_agg(json_build_object(
              'program_name', ps.program_name,
              'program_type', ps.program_type,
              'selection_order', ps.selection_order
            ) ORDER BY ps.selection_order)
            FROM user_program_selections ps
            WHERE ps.lead_id = l.lead_id
          ), '[]'::json
        ) AS program_selections
      FROM user_leads l
      ORDER BY l.created_at DESC
      LIMIT 50;
      `
    );

    return NextResponse.json({ ok: true, data: leads });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}


