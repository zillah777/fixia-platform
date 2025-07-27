# Manual de Diseño Fixia - Guías para Desarrollo

## Identidad de Marca

**Nombre:** Fixia  
**Eslogan:** Conecta. Confía. Resuelve.  
**Descripción:** Marketplace moderno y minimalista de microservicios que conecta profesionales altamente calificados con usuarios que necesitan soluciones efectivas.

## Estética Visual

- **Estilo:** Liquid Glass inspirado en iOS
- **Características:** Transparencia, fluidez, experiencia elegante e intuitiva
- **Modo:** Oscuro por defecto, opción clara disponible

## Sistema de Colores

### Colores Principales

```css
/* Primary - Liquid Blue */
--primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  --primary-solid: #667eea /* Status Colors */
  --success: #51cf66 --warning: #ffd93d --destructive: #ff6b6b
  /* Glass Effects */ --glass-light: rgba(255, 255, 255, 0.1)
  --glass-medium: rgba(255, 255, 255, 0.15)
  --glass-strong: rgba(255, 255, 255, 0.2);
```

## Tipografía

- **Fuente Primaria:** SF Pro Display (Apple-style) o Inter/Poppins como alternativa
- **Estilo:** Sans serif custom minimal con ligaduras suaves
- **Títulos:** Negrita, mayúsculas opcionales
- **Texto:** Regular, 16px base para accesibilidad
- **Alineación:** Siempre justificación izquierda

## Componentes Base

### Glass Morphism

Todos los componentes principales deben usar efectos de vidrio:

```jsx
// Clases CSS disponibles:
.glass          // Efecto ligero
.glass-medium   // Efecto medio
.glass-strong   // Efecto fuerte
```

### Botones

```jsx
// Botón principal con gradiente líquido
<Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">

// Botón secundario con efecto glass
<Button variant="ghost" className="glass-medium hover:glass-strong transition-all duration-300">
```

### Cards

```jsx
// Todas las cards deben usar glass y animaciones
<Card className="glass hover:glass-medium transition-all duration-300 border-white/10 animate-float">
```

### Badges

```jsx
// Estados con colores específicos
const getStatusVariant = (status) => {
  switch (status) {
    case "Completado": return "bg-success/20 text-success border-success/30"
    case "En Progreso": return "bg-primary/20 text-primary border-primary/30"
    case "Esperando Revisión": return "bg-warning/20 text-warning border-warning/30"
    // ...otros estados
  }
}
```

## Animaciones

### Animaciones Disponibles

```css
.animate-float        // Flotación suave
.animate-pulse-slow   // Pulsación lenta
```

### Transiciones Motion

```jsx
// Entrada estándar para componentes
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}

// Hover effects con spring
whileHover={{ scale: 1.05 }}
transition={{ type: "spring", stiffness: 400, damping: 10 }}
```

## Iconografía

- **Estilo:** Línea fina, semi-transparente
- **Biblioteca:** Lucide Icons + íconos personalizados
- **Comportamiento:** Animación sutil al interactuar

## Estructura de Navegación Fixia

### Navegación Principal

1. **Inicio**
2. **Buscar servicios**
3. **Ofrecer mis servicios**
4. **Mi perfil**
5. **Centro de confianza** (reputación, pagos, soporte)

### Elementos de Navegación

```jsx
// Logo con gradiente y efecto flotante
<div className="h-10 w-10 liquid-gradient rounded-xl flex items-center justify-center shadow-lg">
  <span className="text-white font-bold text-lg">F</span>
</div>

// Búsqueda con glass effect
<Input className="glass border-white/20 focus:border-primary/50 focus:ring-primary/30" />
```

## Patrones de Componentes

### Hero Panel

- Saludo personalizado con emoji
- Grid de estadísticas 2x2 o 4 columnas
- Gráficos con gradientes líquidos
- Logros con badges coloridos

### Summary Cards

- Grid responsive (md:grid-cols-2 lg:grid-cols-3)
- Iconos con hover effects
- Barras de progreso con gradientes
- Métricas específicas del marketplace

### Tablas de Servicios

- Headers con sorting
- Avatares con ring effects
- Progress bars animadas
- Dropdown menus con glass effect

## Mensajes de Marca

### Tono de Comunicación

- **En la app:** Claro, directo, empático
- **En marketing:** Inspirador, tecnológico, con confianza
- **En errores:** Amigable, nunca culposo

### Mensajes Clave

- "Tu tiempo vale. Fixia lo cuida."
- "Profesionales reales, resultados concretos."
- "Transparencia líquida: ves lo que contratas."

## Principios UX

### Simplicidad Radical

- Una acción por pantalla
- Navegación intuitiva
- Feedback claro e inmediato

### Transparencia Visual

- Capas difuminadas que no saturan
- Información siempre visible y accesible
- Estados claros y comprensibles

### Microinteracciones

- Cada interacción debe aportar placer
- Animaciones suaves y funcionales
- Respuestas visuales inmediatas

## Layout y Espaciado

### Container

```jsx
<main className="container mx-auto px-6 py-8 space-y-12">
```

### Grid Systems

```jsx
// Stats grid
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

// Cards grid
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

// Charts layout
<div className="grid gap-6 md:grid-cols-12">
```

## Background Effects

### Elementos Decorativos

```jsx
// Elementos de fondo flotantes
<div className="fixed inset-0 pointer-events-none overflow-hidden">
  <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-10 animate-float"></div>
  <div className="absolute top-3/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-10 animate-float"></div>
</div>
```

## Accesibilidad

### Contraste

- Mínimo WCAG AA
- Textos legibles sobre fondos glass
- Estados de focus claramente visibles

### Navegación

- Soporte completo de teclado
- Compatible con screen readers
- Animaciones reducidas para modo accesible

## Implementación

### Imports Requeridos

```jsx
import { motion } from "motion/react";
// Iconos de Lucide React
// Componentes UI de Shadcn
```

### Clases CSS Personalizadas

- Todas las utilidades glass están definidas en `/styles/globals.css`
- Variables CSS para colores y efectos
- Animaciones custom para floating y pulse

---

**Nota Importante:** Siempre mantener la coherencia visual. Cada nuevo componente debe seguir estos patrones establecidos para garantizar una experiencia uniforme en toda la aplicación Fixia.