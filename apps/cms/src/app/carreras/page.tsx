'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function CarrerasPage() {
  const [data, setData] = useState<any[]>([])
  const [facultades, setFacultades] = useState<any[]>([])
  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [facultadId, setFacultadId] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch('/api/carreras')
    const json = await res.json()
    setData(json.data || [])
  }

  async function loadFacultades() {
    const res = await fetch('/api/facultades')
    const json = await res.json()
    setFacultades(json.data || [])
  }

  async function create() {
    setLoading(true)
    await fetch('/api/carreras', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, nombre, facultad_id: facultadId }) })
    setId(''); setNombre(''); setFacultadId('')
    await load()
    setLoading(false)
  }

  useEffect(() => { 
    load()
    loadFacultades()
  }, [])

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Gestión de Carreras</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Administra las carreras académicas de CExCIE. Cada carrera pertenece a una facultad y puede estar disponible en diferentes campus y modalidades.
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800 mb-8">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Total de Carreras</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{data.length}</p>
            </div>
          </div>
        </div>

        {/* Add New Career Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Agregar Nueva Carrera</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Para agregar una nueva carrera, ingresa un ID único (ej: "enf", "ing-sis"), el nombre completo de la carrera y selecciona la facultad a la que pertenece del menú desplegable. 
            Luego haz clic en "Agregar" para guardarla en el sistema.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input 
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" 
              placeholder="ID de la carrera (ej: enf)" 
              value={id} 
              onChange={e=>setId(e.target.value)} 
            />
            <input 
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" 
              placeholder="Nombre de la carrera" 
              value={nombre} 
              onChange={e=>setNombre(e.target.value)} 
            />
            <select 
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" 
              value={facultadId} 
              onChange={e=>setFacultadId(e.target.value)}
            >
              <option value="">Seleccionar facultad</option>
              {facultades.map((facultad: any) => (
                <option key={facultad.id} value={facultad.id}>
                  {facultad.nombre} ({facultad.id})
                </option>
              ))}
            </select>
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={create} 
              disabled={loading || !id || !nombre || !facultadId}
            >
              {loading ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Listado de Carreras</span>
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Career List */}
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z" />
              </svg>
              <p className="mt-2">No hay carreras registradas</p>
            </div>
          ) : (
            data.map((carrera:any) => (
              <div key={carrera.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                      <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{carrera.nombre}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {carrera.id} • Facultad: {carrera.facultad_id}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/carreras/${carrera.id}`} 
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-purple-600 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors"
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
