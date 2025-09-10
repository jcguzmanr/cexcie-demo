'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function CampusPage() {
  const [data, setData] = useState<any[]>([])
  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch('/api/campus')
    const json = await res.json()
    setData(json.data || [])
  }

  async function create() {
    setLoading(true)
    await fetch('/api/campus', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, nombre }) })
    setId(''); setNombre('');
    await load()
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Gestión de Campus</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Administra los campus universitarios de CExCIE. Cada campus representa una ubicación física donde se imparten las carreras.
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 mb-8">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Total de Campus</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.length}</p>
            </div>
          </div>
        </div>

        {/* Add New Campus Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Agregar Nuevo Campus</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Para agregar un nuevo campus, ingresa un ID único (ej: "lima", "arequipa") y el nombre completo del campus. 
            Luego haz clic en "Agregar" para guardarlo en el sistema.
          </p>
          <div className="flex gap-3">
            <input 
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 flex-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
              placeholder="ID del campus (ej: lima)" 
              value={id} 
              onChange={e=>setId(e.target.value)} 
            />
            <input 
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 flex-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
              placeholder="Nombre del campus" 
              value={nombre} 
              onChange={e=>setNombre(e.target.value)} 
            />
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={create} 
              disabled={loading || !id || !nombre}
            >
              {loading ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Listado de Campus</span>
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Campus List */}
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="mt-2">No hay campus registrados</p>
            </div>
          ) : (
            data.map((campus:any) => (
              <div key={campus.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{campus.nombre}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {campus.id}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/campus/${campus.id}`} 
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
