# VanSport E-commerce

Sistema de comercio electrónico para Distribuidora VanSport. Catálogo de productos, carrito de compras, procesamiento de pedidos y panel de administración.

## Tech Stack

### Frontend
- **React 19** + **Vite 7**
- **Tailwind CSS v4**
- **React Router v7**
- **i18next** (internacionalización ES/EN)
- **Fetch API** con `credentials: 'include'`

### Backend
- **NestJS** (Express platform)
- **Drizzle ORM** + PostgreSQL
- **BetterAuth** (autenticación por sesión)
- **class-validator** + **class-transformer** (DTOs)

## Estructura del proyecto

```
├── frontend/                    # Aplicación React
│   ├── public/locales/          # Traducciones i18n (ES/EN)
│   └── src/
│       ├── components/          # Componentes reutilizables
│       ├── config/              # Configuración (API client)
│       ├── context/             # AuthContext, ThemeContext
│       ├── pages/               # Páginas por módulo
│       │   ├── App/             # Frontend público y de usuario
│       │   └── Admin/           # Panel de administración
│       ├── services/            # Endpoints de la API
│       ├── utils/               # Utilidades y helpers
│       └── i18n.js              # Configuración de i18next
│
├── backend-NestJs/              # API REST con NestJS
│   ├── db/
│   │   └── schema/              # Esquemas Drizzle ORM
│   └── src/
│       ├── modules/             # Módulos por entidad
│       ├── common/              # Guards, decoradores, filtros
│       └── main.ts
│
└── README.md
```

## Requisitos

- Node.js >= 18
- pnpm
- PostgreSQL

## Instalación

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

### Backend

```bash
cd backend-NestJs
pnpm install
pnpm run start:dev
```

## Variables de Entorno

### Frontend (`frontend/.env`)

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend | `http://localhost:8080` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID (opcional) | — |

### Backend (`backend-NestJs/.env`)

Variables requeridas: conexión a PostgreSQL (`DATABASE_URL`), secretos de BetterAuth, credenciales de email, etc. Ver `.env.example` en el directorio del backend.

## Scripts disponibles

### Frontend

| Comando | Descripción |
|---------|-------------|
| `pnpm run dev` | Servidor de desarrollo |
| `pnpm run build` | Build de producción |
| `pnpm run preview` | Vista previa del build |
| `pnpm run lint` | ESLint |

### Backend

| Comando | Descripción |
|---------|-------------|
| `pnpm run start:dev` | Servidor de desarrollo con hot-reload |
| `pnpm run build` | Compilar a JavaScript |
| `pnpm run start:prod` | Iniciar en producción |
| `pnpm run test` | Tests (Vitest) |
| `pnpm run lint` | ESLint |

### Base de Datos

| Comando | Descripción |
|---------|-------------|
| `pnpm db:generate` | Genera archivos de migración desde los schemas (`db/schema/`) |
| `pnpm db:migrate` | Aplica las migraciones pendientes a la BD |
| `pnpm db:push` | Sincroniza el schema directo (sin archivos de migración, ideal en desarrollo) |
| `pnpm db:pull` | Importa el schema desde la BD existente |
| `pnpm db:seed` | Ejecuta el seed (`db/seed.ts`) con datos iniciales |
| `pnpm db:studio` | Abre Drizzle Studio (UI para explorar la BD) |

**Flujo de trabajo típico:**

1. Editar los schemas en `backend-NestJs/db/schema/`
2. `pnpm db:generate` — genera los archivos SQL en `db/migrations/`
3. `pnpm db:migrate` — aplica los cambios a PostgreSQL

> `db:push` es útil en desarrollo para iterar rápido, pero en producción siempre usar `db:generate` + `db:migrate`.
