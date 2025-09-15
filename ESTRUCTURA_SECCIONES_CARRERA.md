# Estructura de Secciones para Carreras

## Descripción General
El campo `secciones` en la base de datos debe contener un objeto JSON con la información detallada de cada carrera. Cada sección corresponde a una pestaña en el detalle de la carrera.

## Estructura Completa

### 1. **sobre** - Información General
```json
{
  "sobre": {
    "titulo": "string",           // Título de la sección
    "descripcion": "string",      // Descripción principal de la carrera
    "media": {                    // (Opcional) Imagen o video
      "type": "image|video",
      "alt": "string",            // Texto alternativo
      "src": "string"             // Ruta de la imagen/video
    },
    "infoCards": [                // (Opcional) Tarjetas informativas
      {
        "id": "string",           // ID único
        "icon": "string",         // Emoji o icono
        "titulo": "string",       // Título de la tarjeta
        "contenido": "string|string[]", // Contenido (texto o array)
        "descripcion": "string"   // Descripción adicional
      }
    ]
  }
}
```

### 2. **planEstudios** - Plan de Estudios
```json
{
  "planEstudios": {
    "legendEtapas": {             // Leyenda de colores para las etapas
      "adaptacion": {
        "label": "string",        // Nombre de la etapa
        "color": "string",        // Color en hexadecimal
        "descripcion": "string"   // Descripción de la etapa
      },
      "profundizacion": { ... },
      "consolidacion": { ... }
    },
    "ciclos": [                   // Array de ciclos académicos
      {
        "numero": "number",       // Número del ciclo (1, 2, 3...)
        "creditos": "number",     // Créditos del ciclo
        "etapa": "string",        // adaptacion|profundizacion|consolidacion
        "cursos": ["string"],     // Array de nombres de cursos
        "notas": ["string"]       // (Opcional) Notas adicionales
      }
    ]
  }
}
```

### 3. **internacional** - Programas Internacionales
```json
{
  "internacional": {
    "cards": [                    // Array de tarjetas de programas
      {
        "titulo": "string",       // Título del programa
        "texto": "string",        // Descripción del programa
        "cta": {                  // (Opcional) Call to action
          "label": "string",      // Texto del botón
          "action": "string",     // Acción a realizar
          "payload": "string"     // Datos adicionales
        },
        "videoUrl": "string"      // (Opcional) URL del video
      }
    ]
  }
}
```

### 4. **beneficios** - Beneficios de la Carrera
```json
{
  "beneficios": {
    "bloques": [                  // Array de bloques de beneficios
      {
        "titulo": "string",       // Título del bloque
        "items": ["string"]       // Array de beneficios
      }
    ]
  }
}
```

### 5. **testimonios** - Testimonios (Opcional)
```json
{
  "testimonios": {
    "estudiantes": [              // (Opcional) Testimonios de estudiantes
      {
        "id": "string",           // ID único
        "nombre": "string",       // Nombre del estudiante
        "foto": "string",         // Emoji o iniciales
        "campus": "string",       // Campus donde estudia
        "ciclo": "string",        // Ciclo que cursa
        "testimonio": "string",   // Texto del testimonio
        "destacado": "string"     // (Opcional) Logro destacado
      }
    ],
    "egresados": [                // (Opcional) Testimonios de egresados
      {
        "id": "string",           // ID único
        "nombre": "string",       // Nombre del egresado
        "foto": "string",         // Emoji o iniciales
        "cargo": "string",        // Cargo actual
        "empresa": "string",      // Empresa donde trabaja
        "egreso": "string",       // Año de egreso
        "testimonio": "string",   // Texto del testimonio
        "destacado": "string"     // (Opcional) Logro destacado
      }
    ]
  }
}
```

## Secciones Adicionales

### 6. **costos** - Información de Costos
Esta sección se alimenta desde la API `/api/didactics` y no requiere datos en el JSON.

### 7. **modalidades** - Comparación de Modalidades
Esta sección se alimenta desde la API `/api/modalidad-comparison` y no requiere datos en el JSON.

## Ejemplo Mínimo Válido

```json
{
  "secciones": {
    "sobre": {
      "titulo": "Sobre la carrera",
      "descripcion": "Descripción básica de la carrera"
    },
    "planEstudios": {
      "legendEtapas": {
        "adaptacion": {
          "label": "Adaptación",
          "color": "#B9E1FF",
          "descripcion": "Etapa de adaptación"
        }
      },
      "ciclos": [
        {
          "numero": 1,
          "creditos": 22,
          "etapa": "adaptacion",
          "cursos": ["Curso 1", "Curso 2"]
        }
      ]
    },
    "internacional": {
      "cards": [
        {
          "titulo": "Programa internacional",
          "texto": "Descripción del programa"
        }
      ]
    },
    "beneficios": {
      "bloques": [
        {
          "titulo": "Beneficios principales",
          "items": ["Beneficio 1", "Beneficio 2"]
        }
      ]
    }
  }
}
```

## Notas Importantes

1. **Campos Obligatorios**: Solo `sobre`, `planEstudios`, `internacional` y `beneficios` son obligatorios.
2. **Campos Opcionales**: `testimonios`, `media`, `infoCards`, `cta`, `videoUrl`, `notas`, `destacado`.
3. **Colores**: Usar formato hexadecimal (#RRGGBB) para los colores de las etapas.
4. **Emojis**: Se pueden usar emojis en los campos `icon` y `foto`.
5. **URLs**: Las URLs de videos deben ser de YouTube o plataformas compatibles.
6. **Validación**: El JSON debe ser válido y seguir la estructura exacta mostrada.

## Errores Comunes

- **Falta de campos obligatorios**: Asegúrate de incluir todas las secciones requeridas.
- **JSON inválido**: Verifica que el JSON esté bien formateado.
- **Tipos incorrectos**: Los arrays deben ser arrays, los strings deben ser strings, etc.
- **Referencias rotas**: Las URLs de imágenes y videos deben ser válidas.
