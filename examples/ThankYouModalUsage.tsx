"use client";

import { useState } from 'react';
import { SendResultsModal } from '@/components/SendResultsModal';
import { Carrera } from '@/data/schemas';

// Ejemplo de uso para carrera individual
export function CareerExample() {
  const [sendOpen, setSendOpen] = useState(false);
  
  const carrera: Carrera = {
    id: "ing-amb",
    nombre: "Ingeniería Ambiental",
    facultadId: "ing",
    modalidades: ["presencial", "semipresencial"],
    campus: ["arequipa", "cusco", "huancayo", "los-olivos", "miraflores", "ica"],
    mallaResumen: [],
    imagen: "/carreras/ing-amb.png"
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ejemplo: Carrera Individual</h2>
      <button 
        onClick={() => setSendOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Abrir Modal de Carrera
      </button>

      <SendResultsModal 
        open={sendOpen} 
        onClose={() => setSendOpen(false)} 
        careerNames={[carrera.nombre]}
        source="career"
        selectedCarreras={[carrera]}
      />
    </div>
  );
}

// Ejemplo de uso para comparador
export function ComparatorExample() {
  const [sendOpen, setSendOpen] = useState(false);
  
  const carreras: Carrera[] = [
    {
      id: "ing-amb",
      nombre: "Ingeniería Ambiental",
      facultadId: "ing",
      modalidades: ["presencial", "semipresencial"],
      campus: ["arequipa", "cusco", "huancayo", "los-olivos", "miraflores", "ica"],
      mallaResumen: [],
      imagen: "/carreras/ing-amb.png"
    },
    {
      id: "ing-civ",
      nombre: "Ingeniería Civil",
      facultadId: "ing",
      modalidades: ["presencial", "semipresencial"],
      campus: ["arequipa", "cusco", "huancayo", "los-olivos", "miraflores", "ica"],
      mallaResumen: [],
      imagen: "/carreras/ing-civ.png"
    },
    {
      id: "ing-elec",
      nombre: "Ingeniería Eléctrica",
      facultadId: "ing",
      modalidades: ["presencial", "semipresencial"],
      campus: ["arequipa", "cusco", "huancayo", "los-olivos", "miraflores", "ica"],
      mallaResumen: [],
      imagen: "/carreras/ing-elec.png"
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ejemplo: Comparador de Carreras</h2>
      <button 
        onClick={() => setSendOpen(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Abrir Modal de Comparador
      </button>

      <SendResultsModal 
        open={sendOpen} 
        onClose={() => setSendOpen(false)} 
        careerNames={carreras.map(c => c.nombre)}
        source="comparator"
        selectedCarreras={carreras}
      />
    </div>
  );
}

// Ejemplo completo con ambos modos
export function CompleteExample() {
  const [mode, setMode] = useState<"career" | "comparator">("career");
  const [sendOpen, setSendOpen] = useState(false);

  const getModalProps = () => {
    if (mode === "career") {
      return {
        careerNames: ["Ciencias de la Computación"],
        source: "career" as const,
        selectedCarreras: [
          {
            id: "comp",
            nombre: "Ciencias de la Computación",
            facultadId: "ing",
            modalidades: ["presencial", "semipresencial"] as ("presencial" | "semipresencial" | "distancia")[],
            campus: ["arequipa", "cusco", "huancayo", "los-olivos", "miraflores", "ica"],
            mallaResumen: [],
            imagen: "/carreras/comp.png"
          }
        ]
      };
    } else {
      return {
        careerNames: ["Ciencias de la Computación", "Ingeniería de Sistemas", "Administración y Finanzas"],
        source: "comparator" as const,
        selectedCarreras: [
          {
            id: "comp",
            nombre: "Ciencias de la Computación",
            facultadId: "ing",
            modalidades: ["presencial", "semipresencial"] as ("presencial" | "semipresencial" | "distancia")[],
            campus: ["arequipa", "cusco", "huancayo", "los-olivos", "miraflores", "ica"],
            mallaResumen: [],
            imagen: "/carreras/comp.png"
          },
          {
            id: "sis",
            nombre: "Ingeniería de Sistemas e Informática",
            facultadId: "ing",
            modalidades: ["presencial", "semipresencial"] as ("presencial" | "semipresencial" | "distancia")[],
            campus: ["arequipa", "cusco", "huancayo", "los-olivos", "miraflores", "ica"],
            mallaResumen: [],
            imagen: "/carreras/sistemas.png"
          },
          {
            id: "admfin",
            nombre: "Administración y Finanzas",
            facultadId: "emp",
            modalidades: ["presencial", "semipresencial", "distancia"] as ("presencial" | "semipresencial" | "distancia")[],
            campus: ["arequipa", "cusco", "huancayo", "los-olivos", "miraflores", "ica"],
            mallaResumen: [],
            imagen: "/carreras/admfin.png"
          }
        ]
      };
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-100">
        Demo: Vista de Agradecimiento - Dark Mode
      </h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-gray-100">Modo Carrera Individual</h3>
          <p className="text-sm text-gray-400 mb-3">
            Muestra información específica de una carrera con highlights personalizados.
          </p>
          <button 
            onClick={() => {
              setMode("career");
              setSendOpen(true);
            }}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Probar Carrera Individual
          </button>
        </div>

        <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-gray-100">Modo Comparador</h3>
          <p className="text-sm text-gray-400 mb-3">
            Muestra comparación de múltiples carreras con highlights de comparación.
          </p>
          <button 
            onClick={() => {
              setMode("comparator");
              setSendOpen(true);
            }}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Probar Comparador
          </button>
        </div>
      </div>

      <div className="text-center text-sm text-gray-400 space-y-2">
        <p>Selecciona un modo y abre el modal para ver la nueva implementación en acción.</p>
        <p>✨ <strong>Tema:</strong> Aplicación configurada exclusivamente en Dark Mode con los colores institucionales de CExCIE.</p>
        <p>Todos los eventos se registran en la consola del navegador.</p>
      </div>

      <SendResultsModal 
        open={sendOpen} 
        onClose={() => setSendOpen(false)} 
        {...getModalProps()}
      />
    </div>
  );
}
