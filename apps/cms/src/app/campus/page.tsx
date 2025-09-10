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
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Campus</h1>
        <div className="flex gap-2 mb-4">
          <input className="border px-2 py-1 flex-1" placeholder="id" value={id} onChange={e=>setId(e.target.value)} />
          <input className="border px-2 py-1 flex-1" placeholder="nombre" value={nombre} onChange={e=>setNombre(e.target.value)} />
          <button className="border px-3 py-1" onClick={create} disabled={loading || !id || !nombre}>Agregar</button>
        </div>
        <ul className="space-y-2">
          {data.map((f:any) => (
            <li key={f.id} className="border p-2 rounded flex items-center justify-between">
              <span>{f.nombre} <span className="text-gray-400">({f.id})</span></span>
              <Link href={`/campus/${f.id}`} className="text-blue-600 underline text-sm">editar</Link>
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  )
}
