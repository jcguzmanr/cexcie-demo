'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CarreraDetail({ params }: any) {
  const { id } = params
  const [form, setForm] = useState<any>({ nombre:'', facultad_id:'', duracion:'', grado:'', titulo:'', imagen:'', campus:[], modalidades:[], detalle:{ secciones:{} } })
  const [facultades, setFacultades] = useState<any[]>([])
  const [campus, setCampus] = useState<any[]>([])
  const [modalidades, setModalidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadFacultades() {
    const res = await fetch('/api/facultades')
    const json = await res.json()
    setFacultades(json.data || [])
  }

  async function loadCampus() {
    const res = await fetch('/api/campus')
    const json = await res.json()
    setCampus(json.data || [])
  }

  async function loadModalidades() {
    const res = await fetch('/api/modalidades')
    const json = await res.json()
    setModalidades(json.data || [])
  }

  useEffect(() => {
    fetch(`/api/carreras/${id}`).then(r=>r.json()).then(j=>{ 
      const d=j.data||{}
      setForm({
        nombre: d.carrera?.nombre||'',
        facultad_id: d.carrera?.facultad_id||'',
        duracion: d.carrera?.duracion||'',
        grado: d.carrera?.grado||'',
        titulo: d.carrera?.titulo||'',
        imagen: d.carrera?.imagen||'',
        campus: (d.campus||[]).map((x:any)=>x.campus_id),
        modalidades: (d.modalidades||[]).map((x:any)=>x.modalidad_id),
        detalle: d.detalle || { secciones:{} }
      })
      setLoading(false)
    })
    loadFacultades()
    loadCampus()
    loadModalidades()
  }, [id])

  function updateField(k:string, v:any){ setForm((f:any)=>({ ...f, [k]: v })) }

  function toggleCampus(campusId: string) {
    setForm((f: any) => ({
      ...f,
      campus: f.campus.includes(campusId)
        ? f.campus.filter((id: string) => id !== campusId)
        : [...f.campus, campusId]
    }))
  }

  function toggleModalidad(modalidadId: string) {
    setForm((f: any) => ({
      ...f,
      modalidades: f.modalidades.includes(modalidadId)
        ? f.modalidades.filter((id: string) => id !== modalidadId)
        : [...f.modalidades, modalidadId]
    }))
  }

  async function save() {
    setSaving(true)
    await fetch(`/api/carreras/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
  }

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <div className="max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Editar Carrera</h1>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm">ID</label>
          <input className="border px-2 py-1 w-full" value={id} disabled />
        </div>
        <div className="col-span-2">
          <label className="block text-sm">Nombre</label>
          <input className="border px-2 py-1 w-full" value={form.nombre} onChange={e=>updateField('nombre', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Facultad</label>
          <select 
            className="border px-2 py-1 w-full" 
            value={form.facultad_id} 
            onChange={e=>updateField('facultad_id', e.target.value)}
          >
            <option value="">Seleccionar facultad</option>
            {facultades.map((facultad: any) => (
              <option key={facultad.id} value={facultad.id}>
                {facultad.nombre} ({facultad.id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">Duración</label>
          <input className="border px-2 py-1 w-full" value={form.duracion} onChange={e=>updateField('duracion', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Grado</label>
          <input className="border px-2 py-1 w-full" value={form.grado} onChange={e=>updateField('grado', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Título</label>
          <input className="border px-2 py-1 w-full" value={form.titulo} onChange={e=>updateField('titulo', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm">Imagen</label>
          <input className="border px-2 py-1 w-full" value={form.imagen} onChange={e=>updateField('imagen', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-3 font-medium text-gray-900 dark:text-white">Campus Disponibles</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {campus.map((c: any) => (
            <label key={c.id} className="flex items-center space-x-2 p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.campus.includes(c.id)}
                onChange={() => toggleCampus(c.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-900 dark:text-white">{c.nombre}</span>
            </label>
          ))}
        </div>
        {campus.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay campus disponibles</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-3 font-medium text-gray-900 dark:text-white">Modalidades Disponibles</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {modalidades.map((m: any) => (
            <label key={m.id} className="flex items-center space-x-2 p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.modalidades.includes(m.id)}
                onChange={() => toggleModalidad(m.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-900 dark:text-white">{m.nombre}</span>
            </label>
          ))}
        </div>
        {modalidades.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay modalidades disponibles</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Detalle (JSON)</label>
        <textarea className="border px-2 py-1 w-full h-40" value={JSON.stringify(form.detalle)} onChange={e=>{try{updateField('detalle', JSON.parse(e.target.value))}catch{}}} />
      </div>

      <div className="mt-2 flex gap-2">
        <button className="border px-3 py-1" onClick={save} disabled={saving}>Guardar</button>
        <Link className="px-3 py-1 underline" href="/carreras">Volver</Link>
      </div>
    </div>
  )
}
