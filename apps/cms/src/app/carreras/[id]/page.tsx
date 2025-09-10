'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CarreraDetail({ params }: any) {
  const { id } = params
  const [form, setForm] = useState<any>({ nombre:'', facultad_id:'', duracion:'', grado:'', titulo:'', imagen:'', campus:[], modalidades:[], detalle:{ secciones:{} } })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
  }, [id])

  function updateField(k:string, v:any){ setForm((f:any)=>({ ...f, [k]: v })) }

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
          <label className="block text-sm">Facultad ID</label>
          <input className="border px-2 py-1 w-full" value={form.facultad_id} onChange={e=>updateField('facultad_id', e.target.value)} />
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
        <label className="block text-sm mb-1">Campus (IDs separados por coma)</label>
        <input className="border px-2 py-1 w-full" value={form.campus.join(',')} onChange={e=>updateField('campus', e.target.value.split(',').map(x=>x.trim()).filter(Boolean))} />
      </div>
      <div>
        <label className="block text-sm mb-1">Modalidades (IDs separados por coma)</label>
        <input className="border px-2 py-1 w-full" value={form.modalidades.join(',')} onChange={e=>updateField('modalidades', e.target.value.split(',').map(x=>x.trim()).filter(Boolean))} />
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
