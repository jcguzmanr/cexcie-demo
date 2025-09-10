'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function FacultadesPage() {
  const [data, setData] = useState<any[]>([])
  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch('/api/facultades')
    const json = await res.json()
    setData(json.data || [])
  }

  async function create() {
    setLoading(true)
    await fetch('/api/facultades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, nombre }) })
    setId(''); setNombre('');
    await load()
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Gestión de Facultades</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Administra las facultades académicas de CExCIE. Cada facultad agrupa carreras relacionadas y define las modalidades de estudio disponibles.
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800 mb-8">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Total de Facultades</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{data.length}</p>
            </div>
          </div>
        </div>

        {/* Add New Faculty Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Agregar Nueva Facultad</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Para agregar una nueva facultad, ingresa un ID único (ej: "ing", "med") y el nombre completo de la facultad. 
            Luego haz clic en "Agregar" para guardarla en el sistema.
          </p>
          <div className="flex gap-3">
            <input 
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 flex-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" 
              placeholder="ID de la facultad (ej: ing)" 
              value={id} 
              onChange={e=>setId(e.target.value)} 
            />
            <input 
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 flex-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" 
              placeholder="Nombre de la facultad" 
              value={nombre} 
              onChange={e=>setNombre(e.target.value)} 
            />
            <button 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
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
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Listado de Facultades</span>
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Faculty List */}
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="mt-2">No hay facultades registradas</p>
            </div>
          ) : (
            data.map((facultad:any) => (
              <div key={facultad.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                      <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{facultad.nombre}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {facultad.id}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/facultades/${facultad.id}`} 
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
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
