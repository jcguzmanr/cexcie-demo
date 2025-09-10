'use client'
import { useEffect, useState } from 'react'

export default function CampusDetail({ params }: any) {
  const { id } = params
  const [nombre, setNombre] = useState('')
  const [imagen, setImagen] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [map_url, setMapUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/campus/${id}`).then(r=>r.json()).then(j=>{ 
      const d=j.data||{}
      setNombre(d.nombre||'');
      setImagen(d.meta?.imagen||'');
      setDireccion(d.meta?.direccion||'');
      setCiudad(d.meta?.ciudad||'');
      setMapUrl(d.meta?.map_url||'');
      setLoading(false) 
    })
  }, [id])

  async function save() {
    setSaving(true)
    await fetch(`/api/campus/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, imagen, direccion, ciudad, map_url }) })
    setSaving(false)
  }

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <div className="max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Editar Campus</h1>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm">ID</label>
          <input className="border px-2 py-1 w-full" value={id} disabled />
        </div>
        <div className="col-span-2">
          <label className="block text-sm">Nombre</label>
          <input className="border px-2 py-1 w-full" value={nombre} onChange={e=>setNombre(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Imagen</label>
          <input className="border px-2 py-1 w-full" value={imagen} onChange={e=>setImagen(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Dirección</label>
          <input className="border px-2 py-1 w-full" value={direccion} onChange={e=>setDireccion(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Ciudad</label>
          <input className="border px-2 py-1 w-full" value={ciudad} onChange={e=>setCiudad(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Map URL</label>
          <input className="border px-2 py-1 w-full" value={map_url} onChange={e=>setMapUrl(e.target.value)} />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="border px-3 py-1" onClick={save} disabled={saving}>Guardar</button>
        <a className="px-3 py-1" href="/campus">Volver</a>
      </div>
    </div>
  )
}
