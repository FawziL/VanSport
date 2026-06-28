# Eccommerce VanSport Frontend

Eccommerce con panel de administración. Construida con React + Vite.

## Stack

- **Framework:** React 19
- **Build:** Vite 7
- **Routing:** React Router v7
- **Estilos:** Tailwind CSS v4
- **Internacionalización:** i18next + react-i18next
- **API:** fetch nativo con `credentials: 'include'`

## Requisitos

- Node.js >= 18
- pnpm

## Instalación

```bash
cd frontend
pnpm install
pnpm run dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm run dev` | Inicia servidor de desarrollo |
| `pnpm run build` | Compila para producción |
| `pnpm run preview` | Previsualiza build de producción |
| `pnpm run lint` | Ejecuta ESLint |

## Variables de Entorno

Copiar `.env.example` a `.env`:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend API | `http://localhost:8080` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google OAuth (opcional) | — |

## Internacionalización (i18n)

El frontend soporta español e inglés usando i18next con carga bajo demanda.

### Archivos de traducción

```
public/locales/
├── es/
│   ├── common.json    — Componentes compartidos (NavBar, Footer, botones)
│   └── home.json      — Página de inicio
└── en/
    ├── common.json
    └── home.json
```

### Namespaces

Cada página o módulo tiene su propio namespace para mantener los archivos ligeros:

- `common` — strings compartidos (NavBar, Footer, LanguageToggle)
- `home` — página de inicio
- Se agregarán más namespaces por módulo según se expanda

### Añadir nuevas traducciones

1. Agregar las claves en los archivos JSON correspondientes (es y en)
2. Usar `useTranslation('namespace')` en el componente
3. Reemplazar strings con `t('clave')`

### Detección de idioma

- Orden: `localStorage` → idioma del navegador
- Persiste la elección del usuario automáticamente
- Si el JSON del idioma seleccionado no se ha descargado, muestra español como fallback

## Estructura del proyecto

```
src/
├── components/       — Componentes reutilizables
│   └── ui/           — Componentes base (Table, etc.)
├── config/           — Configuración (API, HTTP client)
├── context/          — Contextos (Auth, Theme)
├── pages/
│   ├── App/          — Páginas públicas y de usuario
│   │   ├── Home/
│   │   ├── Productos/
│   │   ├── Carrito/
│   │   ├── Checkout/
│   │   ├── Pedidos/
│   │   ├── Perfil/
│   │   ├── Reportes/
│   │   └── auth/     — Login, Register, PasswordReset
│   └── Admin/        — Panel de administración
│       ├── Dashboard/
│       ├── Categorias/
│       ├── Productos/
│       ├── Usuarios/
│       ├── Pedidos/
│       ├── Ventas/
│       ├── Resenas/
│       ├── Notificaciones/
│       ├── Envios/
│       ├── Reportes/
│       └── MetodosPago/
├── services/         — Llamadas a la API
├── utils/            — Utilidades (helpers, componentes inline)
├── i18n.js           — Configuración de i18next
└── main.jsx          — Punto de entrada
```
