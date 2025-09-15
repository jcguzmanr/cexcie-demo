'use client'
import { useEffect, useMemo, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'

type Event = {
  id: string
  lead_id: string
  lead_name?: string | null
  page_path: string
  page_title: string | null
  action_type: string
  entity_type: string | null
  entity_name: string | null
  timestamp: string
}

export default function TelemetryPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [leadId, setLeadId] = useState('')

  async function load(params?: { lead_id?: string }) {
    setLoading(true)
    const qs = params?.lead_id ? `?lead_id=${encodeURIComponent(params.lead_id)}` : ''
    const res = await fetch(`/api/telemetry${qs}`)
    const json = await res.json()
    setEvents(json.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const canSearch = useMemo(() => leadId.trim().length > 0, [leadId])

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Eventos de Telemetría</h1>
          <p className="text-gray-600 dark:text-gray-400">Últimos 200 eventos registrados de navegación y acciones.</p>
        </div>

        <div className="mb-4 flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Filtrar por Lead ID</label>
            <input 
              value={leadId}
              onChange={e=>setLeadId(e.target.value)}
              placeholder="lead_1703123789456_xyz789"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm"
            />
          </div>
          <button
            onClick={() => load({ lead_id: leadId })}
            disabled={!canSearch || loading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
          >Buscar</button>
          <button
            onClick={() => { setLeadId(''); load(); }}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >Limpiar</button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidad</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr><td className="px-4 py-6 text-center" colSpan={5}>Cargando...</td></tr>
              ) : events.length === 0 ? (
                <tr><td className="px-4 py-6 text-center" colSpan={5}>Sin eventos</td></tr>
              ) : (
                events.map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2 text-sm">{new Date(ev.timestamp).toLocaleString('es-PE')}</td>
                    <td className="px-4 py-2 text-sm">
                      <div>{ev.lead_name ?? '—'}</div>
                      <div className="text-xs text-gray-500">{ev.lead_id}</div>
                    </td>
                    <td className="px-4 py-2 text-sm capitalize">{ev.action_type}</td>
                    <td className="px-4 py-2 text-sm">{ev.page_path}{ev.page_title ? ` – ${ev.page_title}` : ''}</td>
                    <td className="px-4 py-2 text-sm">{ev.entity_type ? `${ev.entity_type}: ${ev.entity_name ?? ''}` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  )
}


