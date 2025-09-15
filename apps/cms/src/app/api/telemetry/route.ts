import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('lead_id');

    const base = `
      SELECT 
        t.id,
        t.lead_id,
        l.nombre_completo AS lead_name,
        t.page_path,
        t.page_title,
        t.action_type,
        t.entity_type,
        t.entity_name,
        t.timestamp
      FROM user_navigation_tracking t
      LEFT JOIN user_leads l ON l.lead_id = t.lead_id
      WHERE ($1::text IS NULL OR t.lead_id = $1)
      ORDER BY t.timestamp DESC
      LIMIT 200;
    `;

    const events = await prisma.$queryRawUnsafe<any[]>(base, leadId);

    return NextResponse.json({ ok: true, data: events });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}


