# Implementación de Anclas Informativas (Info Cards)

## Descripción General

Se han implementado anclas informativas en la vista "Sobre la carrera" que muestran información clave de la carrera de manera organizada y visualmente atractiva, similar a la imagen de referencia proporcionada.

## Estructura del JSON

### Nuevo campo: `infoCards`

Dentro de la sección `sobre` del JSON de detalle de carrera, se ha agregado un nuevo campo `infoCards` que contiene un array de tarjetas informativas:

```json
{
  "secciones": {
    "sobre": {
      "titulo": "Sobre la carrera",
      "descripcion": "...",
      "media": { ... },
      "infoCards": [
        {
          "id": "modalidades",
          "icon": "📍",
          "titulo": "Modalidades disponibles",
          "contenido": ["A Distancia", "Presencial", "Semipresencial"],
          "descripcion": "Elige la modalidad que mejor se adapte a tu estilo de vida y horarios"
        }
      ]
    }
  }
}
```

### Campos de cada Info Card

- **`id`**: Identificador único para la tarjeta (usado para navegación y estilos)
- **`icon`**: Emoji o icono representativo de la información
- **`titulo`**: Título descriptivo de la información
- **`contenido`**: Puede ser un string o array de strings con la información principal
- **`descripcion`**: Texto explicativo adicional que aparece debajo del contenido

## Tipos de Contenido

### Contenido Simple (String)
```json
{
  "contenido": "Bachiller en Ingeniería de Sistemas e Informática"
}
```

### Contenido Lista (Array)
```json
{
  "contenido": [
    "Desarrollador de Aplicaciones Web",
    "Analista de Sistemas",
    "Desarrollador Móvil y de Realidad Virtual"
  ]
}
```

## Implementación en el Frontend

### Renderizado Automático
Las tarjetas se renderizan automáticamente en un grid responsivo:
- **Mobile**: 1 columna
- **Tablet**: 2 columnas  
- **Desktop**: 3 columnas

### Funcionalidades
- **Hover Effects**: Las tarjetas tienen efectos de hover con sombras y escalado del icono
- **Responsive**: Se adaptan automáticamente a diferentes tamaños de pantalla
- **Interactivas**: Cada tarjeta es clickeable (actualmente solo log, pero se puede expandir)

### Estilos
- Bordes redondeados con el tema de la aplicación
- Iconos en color púrpura (`--uc-purple`)
- Transiciones suaves para mejor UX
- Espaciado consistente con el resto de la interfaz

## Ejemplos de Uso

### Carrera de Ciencia de la Computación
```json
{
  "id": "modalidades",
  "icon": "📍",
  "titulo": "Modalidades disponibles",
  "contenido": ["A Distancia", "Presencial", "Semipresencial"],
  "descripcion": "Elige la modalidad que mejor se adapte a tu estilo de vida y horarios"
}
```

### Ingeniería Ambiental
```json
{
  "id": "certificaciones",
  "icon": "📚",
  "titulo": "Certificaciones",
  "contenido": [
    "Auditor Ambiental",
    "Gestor de Residuos Sólidos",
    "Especialista en Calidad del Aire"
  ],
  "descripcion": "Certificaciones que validan tu expertise ambiental"
}
```

## Ventajas de esta Implementación

1. **Consistencia**: Todas las carreras pueden usar la misma estructura
2. **Flexibilidad**: El contenido puede ser texto simple o listas
3. **Escalabilidad**: Fácil agregar o quitar tarjetas según la carrera
4. **Mantenibilidad**: Estructura clara y fácil de entender
5. **Reutilización**: La misma lógica funciona para todas las carreras

## Uso en Base de Datos

Esta estructura JSON puede ser fácilmente mapeada a tablas de base de datos:

### Tabla Principal: `carrera_info_cards`
```sql
CREATE TABLE carrera_info_cards (
  id SERIAL PRIMARY KEY,
  carrera_id TEXT REFERENCES carrera(id),
  card_id TEXT NOT NULL,
  icon TEXT NOT NULL,
  titulo TEXT NOT NULL,
  contenido JSONB NOT NULL,
  descripcion TEXT,
  orden INTEGER DEFAULT 0
);
```

### Ejemplo de Inserción
```sql
INSERT INTO carrera_info_cards (carrera_id, card_id, icon, titulo, contenido, descripcion, orden) 
VALUES (
  'ciencia-de-la-computacion',
  'modalidades',
  '📍',
  'Modalidades disponibles',
  '["A Distancia", "Presencial", "Semipresencial"]',
  'Elige la modalidad que mejor se adapte a tu estilo de vida y horarios',
  1
);
```

## Próximos Pasos

1. **Implementar modales**: Expandir la información al hacer clic en las tarjetas
2. **Filtros**: Permitir filtrar carreras por características específicas
3. **Comparación**: Usar las tarjetas para comparar carreras
4. **Búsqueda**: Implementar búsqueda por contenido de las tarjetas
5. **Analytics**: Trackear qué información es más consultada

## Archivos Modificados

- `public/data/detalle-carrera.json` - Agregado campo `infoCards`
- `public/data/detalle-carrera-ejemplo.json` - Ejemplo para otras carreras
- `app/carrera/[id]/page.tsx` - Implementación del frontend
- `INFO_CARDS_IMPLEMENTATION.md` - Esta documentación
