'use client'
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'

type Lead = {
  id: string
  nombre_completo: string
  email: string
  telefono: string
  metodo_contacto: string
  source: string
  created_at: string
  lead_id: string
  program_selections?: Array<{ program_name: string; program_type: string; selection_order: number }>
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/leads')
    const json = await res.json()
    setLeads(json.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leads registrados</h1>
          <p className="text-gray-600 dark:text-gray-400">Listado de los últimos 50 leads con su selección de programas.</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
          <span className="text-blue-800 dark:text-blue-200 font-semibold">Total:</span> {leads.length}
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuente</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selecciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr><td className="px-4 py-6 text-center" colSpan={5}>Cargando...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td className="px-4 py-6 text-center" colSpan={5}>Sin leads</td></tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2 text-sm">{new Date(lead.created_at).toLocaleString('es-PE')}</td>
                    <td className="px-4 py-2 text-sm font-medium">{lead.nombre_completo}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="text-gray-900 dark:text-gray-100">{lead.email}</div>
                      <div className="text-gray-500 dark:text-gray-400">{lead.telefono} · {lead.metodo_contacto}</div>
                    </td>
                    <td className="px-4 py-2 text-sm capitalize">{lead.source}</td>
                    <td className="px-4 py-2 text-sm">
                      {lead.program_selections && lead.program_selections.length > 0 ? (
                        <div className="space-x-2">
                          {lead.program_selections.map((p, idx) => (
                            <span key={idx} className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-xs">
                              {p.selection_order}. {p.program_name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
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


