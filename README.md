# Van Sport E-commerce

Sistema de comercio electrónico desarrollado para la Distribuidora Van Sport como proyecto universitario, con el objetivo de modernizar sus procesos de ventas, inventario y logística. Desarrollado bajo buenas prácticas de ingeniería de software utilizando tecnologías modernas y arquitectura escalable.

## 📦 Características principales

- Autenticación de usuarios (registro, login, recuperación de contraseña)
- Catálogo de productos con búsqueda y filtrado
- Carrito de compras y procesamiento de pedidos
- Notificaciones automáticas por email
- Panel administrativo para gestión de productos, pedidos y usuarios

## 🧑‍💻 Tecnologías utilizadas

### Frontend

- React.js
- Tailwind CSS
- Axios

### Backend

- Django (REST Framework)
- PostgreSQL

### Infraestructura

- Docker (opcional)
- Hosting posibles: AWS / Render 

## 📁 Estructura del Proyecto

```
├── frontend/         # Aplicación React
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── App.jsx
├── backend/          # API REST con Django
│   ├── core/
│   ├── ecommerce/
│   └── manage.py
└── README.md
```

## ⚙️ Instalación y uso local

### Prerrequisitos

- Node.js (v18 o superior)
- Python 3.10+
- PostgreSQL

### Configuración del Frontend

```bash
cd frontend
npm install
npm run dev
```

### Configuración del Backend

```bash
cd backend
python -m venv env
source env/bin/activate  # Linux/macOS
env\Scripts\activate     # Windows
pip install -r requirements.txt
```