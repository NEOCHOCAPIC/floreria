# Estructura de Firestore para Flores & Joyería

## Colecciones y Documentos

### 1. **`pageContent`** - Contenido de las páginas
```
/pageContent
  ├─ /home
  │  ├─ mainSlogan: string
  │  ├─ mainDescription: string
  │  ├─ heroSection: object
  │  │  ├─ title: string
  │  │  ├─ subtitle: string
  │  │  ├─ showButtons: boolean
  │  └─ quickViewCards: array[3]
  │     ├─ [0] = Joyas Exclusivas
  │     │  ├─ text: string
  │     │  ├─ imageUrl: string
  │     │  └─ link: string
  │     ├─ [1] = Arreglos Florales
  │     │  ├─ text: string
  │     │  ├─ imageUrl: string
  │     │  └─ link: string
  │     └─ [2] = Promoción Destacada
  │        ├─ text: string
  │        ├─ imageUrl: string
  │        └─ link: string
  │
  ├─ /about
  │  ├─ title: string
  │  ├─ subtitle: string
  │  ├─ description: string
  │  ├─ values: array[3]
  │  │  ├─ title: string
  │  │  └─ description: string
  │  └─ mission: string
  │
  ├─ /promotions
  │  ├─ title: string
  │  └─ subtitle: string
  │
  └─ /general
     ├─ phone: string
     ├─ email: string
     ├─ address: string
     └─ hours: string

### 2. **`jewelry`** - Productos de joyería
```
/jewelry
  ├─ /[documentId]
  │  ├─ name: string
  │  ├─ description: string
  │  ├─ price: number
  │  ├─ category: string (Ring, Necklace, Watch, Sparkles, Bracelet)
  │  ├─ imageUrl: string
  │  ├─ featured: boolean
  │  ├─ createdAt: timestamp
  │  └─ updatedAt: timestamp

### 3. **`flowers`** - Productos de flores
```
/flowers
  ├─ /[documentId]
  │  ├─ name: string
  │  ├─ description: string
  │  ├─ price: number
  │  ├─ category: string (Románticos, Celebración, Condolencias, Cumpleaños)
  │  ├─ imageUrl: string
  │  ├─ emoji: string (emoji representative)
  │  ├─ featured: boolean
  │  ├─ createdAt: timestamp
  │  └─ updatedAt: timestamp

### 4. **`promotions`** - Promociones
```
/promotions
  ├─ /[documentId]
  │  ├─ title: string
  │  ├─ description: string
  │  ├─ discount: number (porcentaje)
  │  ├─ type: string (flores, joyas, general)
  │  ├─ imageUrl: string
  │  ├─ code: string (código de promoción)
  │  ├─ active: boolean
  │  ├─ startDate: timestamp
  │  ├─ endDate: timestamp
  │  └─ createdAt: timestamp

### 5. **`categories`** - Categorías
```
/categories
  ├─ /jewelry
  │  ├─ Ring
  │  ├─ Necklace
  │  ├─ Watch
  │  ├─ Sparkles
  │  └─ Bracelet
  │
  └─ /flowers
     ├─ Románticos
     ├─ Celebración
     ├─ Condolencias
     └─ Cumpleaños

### 6. **`users`** - Usuarios del panel admin
```
/users
  ├─ /[uid]
  │  ├─ email: string
  │  ├─ role: string (admin, editor)
  │  ├─ createdAt: timestamp
  │  └─ lastLogin: timestamp

## Índices Recomendados
- `jewelry`: categoria + featured
- `flowers`: categoria + featured
- `promotions`: active + type
```
