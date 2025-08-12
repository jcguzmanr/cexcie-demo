## CExCIE – Catálogo y Comparador de Carreras (Next.js)

Aplicación web para explorar campus, facultades y carreras, con comparador y ficha detallada por carrera. Construida con Next.js (App Router), Tailwind CSS 4, Zustand y Zod, consumiendo datos JSON estáticos bajo `public/data` y validándolos al vuelo.

Repositorio: [`jcguzmanr/cexcie-demo`](https://github.com/jcguzmanr/cexcie-demo)  
Deploy recomendado: Vercel

### Características principales
- Catálogo navegable: `Campus → Facultades → Carreras → Modalidades`.
- Comparador de hasta 3 carreras.
- Vista detallada de carrera.
- Estado global con persistencia en memoria (Zustand).
- Validación de datos con Zod; ingestión inicial desde JSON locales y `public/data`.

### Stack técnico
- Next.js 15 (App Router), React 19, TypeScript.
- Tailwind CSS 4.
- Zustand (estado global), Zod (validación), clsx (estilos condicionales).

---

## Estructura relevante

- `app/` – Rutas del App Router (páginas y layouts).
  - `app/campus`, `app/facultades`, `app/carreras`, `app/carrera/[id]`, `app/comparador`, `app/modalidad`.
- `components/` – UI atómica: `AppShell`, `Chip`, `Modal`, `Toolbar`, etc.
- `data/` – Tipos y esquemas Zod (`schemas.ts`) y JSON de soporte (opcionalmente bundleados).
- `public/data/` – Fuentes JSON servidas por el servidor (`/data/*.json`).
- `lib/ingest.ts` – Lógica de ingestión y validación de datos; expone `window.cexcieIngest` en cliente.
- `store/` – Zustand store y selectores.

---

## Datos y validación

Los datos se cargan idempotentemente al iniciar la app:

- Si el store está vacío, se intenta usar JSON bundleado (import) y luego `fetch('/data/*.json')`.
- Validación con Zod asegura que la estructura coincida con `Campus`, `Facultad`, `Carrera`, `CampusMeta`.

Puedes inyectar datos en tiempo de ejecución desde la consola del navegador con la API global:

```js
// Disponible en el navegador
window.cexcieIngest(
  "/carreras", // ScreenId: '/campus' | '/facultades' | '/carreras' | '/carreras-popup' | '/modalidad' | '/carrera/[id]' | '/campus-meta'
  [
    { id: "ing-sistemas", nombre: "Ingeniería de Sistemas", facultadId: "ing", modalidades: ["presencial"] }
  ]
);
```

Retorna `{ appliedTo: string[]; warnings?: string[] }` con advertencias de validación si las hubiera.

---

## Requisitos
- Node.js 18+ (recomendado 20+)
- npm 9+ (o pnpm/yarn/bun si prefieres)

---

## Desarrollo local

```bash
npm install
npm run dev
# abre http://localhost:3000
```

Scripts disponibles:

```bash
npm run dev     # entorno de desarrollo
npm run build   # build de producción
npm run start   # ejecutar build
npm run lint    # lint con eslint-config-next
```

---

## Despliegue en Vercel

1) Sube el código al repo GitHub `cexcie-demo` (rama `main`).  
2) En Vercel, crea un nuevo proyecto y selecciona el repo.  
3) Configuración por defecto suele ser suficiente:
- Framework: Next.js
- Comando de build: `next build`
- Directorio de salida: `.next` (automático)

Sin variables de entorno obligatorias. Los datos provienen de `public/data/*.json`.

Documentación útil: [Deploy Next.js en Vercel](https://nextjs.org/docs/app/building-your-application/deploying).

---

## Notas de implementación
- UI con Tailwind 4 y componentes ligeros.
- Navegación con breadcrumbs y modales para seleccionar carreras por facultad y modalidad.
- Comparador habilitado cuando hay ≥2 carreras seleccionadas; navegación a detalle cuando hay exactamente 1.

---

## Licencia
Uso interno/demostración.

