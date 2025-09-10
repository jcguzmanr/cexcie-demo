import ProtectedRoute from '@/components/ProtectedRoute';

export default function UsuarioPage() {
  return (
    <ProtectedRoute>
      <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Gestión de Usuarios</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Administra los usuarios del sistema y sus permisos.
        </p>
      </div>

      {/* Work in Progress Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Work in Progress
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>Esta sección está en desarrollo. Próximamente incluirá:</p>
            </div>
          </div>
        </div>
      </div>

      {/* Future Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold ml-3 text-gray-900 dark:text-white">Perfiles de Usuario</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Diferentes roles y permisos para administradores, editores y visualizadores.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold ml-3 text-gray-900 dark:text-white">Gestión de Permisos</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Control granular de acceso a diferentes secciones del CMS.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold ml-3 text-gray-900 dark:text-white">Autenticación Avanzada</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Integración con sistemas de autenticación externos y 2FA.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold ml-3 text-gray-900 dark:text-white">Historial de Actividad</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Registro de acciones y cambios realizados por cada usuario.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0l1.83 7.508a2.25 2.25 0 01-1.83 2.75l-1.83.5a2.25 2.25 0 01-2.75-1.83l-.5-1.83a2.25 2.25 0 011.83-2.75l1.83-.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold ml-3 text-gray-900 dark:text-white">Configuración de Seguridad</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Políticas de contraseñas, sesiones y configuraciones de seguridad.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
              <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold ml-3 text-gray-900 dark:text-white">Equipos y Grupos</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Organización de usuarios en equipos con permisos compartidos.
          </p>
        </div>
      </div>

      {/* Current User Info */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">Usuario Actual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Usuario:</span>
            <span className="ml-2 text-blue-600 dark:text-blue-400">admin</span>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Rol:</span>
            <span className="ml-2 text-blue-600 dark:text-blue-400">Administrador</span>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Estado:</span>
            <span className="ml-2 text-green-600 dark:text-green-400">Activo</span>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Último acceso:</span>
            <span className="ml-2 text-blue-600 dark:text-blue-400">{new Date().toLocaleString('es-ES')}</span>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
