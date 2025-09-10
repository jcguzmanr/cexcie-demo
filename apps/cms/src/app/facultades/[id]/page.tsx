'use client'
import { useEffect, useState } from 'react'

export default function FacultadDetail({ params }: any) {
  const { id } = params
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/facultades/${id}`).then(r=>r.json()).then(j=>{ setNombre(j.data?.nombre||''); setLoading(false) })
  }, [id])

  async function save() {
    setSaving(true)
    await fetch(`/api/facultades/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }) })
    setSaving(false)
  }

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <div className="max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Editar Facultad</h1>
      <div className="space-y-2">
        <label className="block text-sm">ID</label>
        <input className="border px-2 py-1 w-full" value={id} disabled />
        <label className="block text-sm mt-4">Nombre</label>
        <input className="border px-2 py-1 w-full" value={nombre} onChange={e=>setNombre(e.target.value)} />
      </div>
      <div className="mt-4 flex gap-2">
        <button className="border px-3 py-1" onClick={save} disabled={saving}>Guardar</button>
        <a className="px-3 py-1" href="/facultades">Volver</a>
      </div>
    </div>
  )
}
