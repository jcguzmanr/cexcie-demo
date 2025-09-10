import Link from "next/link";

export default function Home() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard CExCIE</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Panel de administración para gestionar la información académica de la Universidad CExCIE.
          Aquí puedes editar y mantener actualizada toda la información de campus, facultades y carreras.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-200">Campus</h2>
          <p className="text-blue-600 dark:text-blue-300 mb-4">Gestiona los campus universitarios, sus ubicaciones y características.</p>
          <Link href="/campus" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Administrar Campus
          </Link>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <h2 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">Facultades</h2>
          <p className="text-green-600 dark:text-green-300 mb-4">Administra las facultades académicas y sus modalidades de estudio.</p>
          <Link href="/facultades" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
            Administrar Facultades
          </Link>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-semibold mb-2 text-purple-800 dark:text-purple-200">Carreras</h2>
          <p className="text-purple-600 dark:text-purple-300 mb-4">Gestiona las carreras académicas, sus detalles y relaciones.</p>
          <Link href="/carreras" className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
            Administrar Carreras
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Información del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Base de Datos:</span> AWS RDS PostgreSQL
          </div>
          <div>
            <span className="font-medium">Estado:</span> 
            <a href="/api/health" target="_blank" className="ml-2 text-blue-600 dark:text-blue-400 hover:underline">
              Verificar conexión
            </a>
          </div>
          <div>
            <span className="font-medium">Última actualización:</span> {new Date().toLocaleDateString('es-ES')}
          </div>
          <div>
            <span className="font-medium">Versión:</span> CMS v1.0
          </div>
        </div>
      </div>
    </div>
  );
}