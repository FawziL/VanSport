import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import Navbar from '@/components/Navbar';
import NotFound from '@/pages/App/NotFound';
import Home from '@/pages/App/Home/Home';
import Productos from '@/pages/App/Productos/Productos';
import VerProducto from '@/pages/App/Productos/VerProducto';
import AdminPage from '@/pages/Admin/AdminPage';
import Perfil from '@/pages/App/Perfil/Perfil';
import Carrito from '@/pages/App/Carrito/Carrito';

import Dashboard from '@/pages/Admin/Dashboard/Dashboard';
import AdminCategorias from '@/pages/Admin/Categorias/ListCategory';
import CrearCategorias from '@/pages/Admin/Categorias/CreateCategory';
import EditarCategorias from '@/pages/Admin/Categorias/EditCategory';
import ListProduct from '@/pages/Admin/Productos/ListProduct';
import CreateProduct from '@/pages/Admin/Productos/CreateProduct';
import EditProduct from '@/pages/Admin/Productos/EditProduct';
import ListUsers from '@/pages/Admin/Usuarios/ListUsers';
import CreateUser from '@/pages/Admin/Usuarios/CreateUser';
import EditUser from '@/pages/Admin/Usuarios/EditUser';
import ListOrders from '@/pages/Admin/Pedidos/ListOrders';
import EditOrder from '@/pages/Admin/Pedidos/EditOrder';
import ListReviews from '@/pages/Admin/Reseñas/ListReviews';
import EditReview from '@/pages/Admin/Reseñas/EditReview';

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main style={{ minHeight: '100vh' }}>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id" element={<VerProducto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/carrito" element={<Carrito />} />

          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminPage>
                <Dashboard />
              </AdminPage>
            }
          />
          <Route
            path="/admin/categorias"
            element={
              <AdminPage>
                <AdminCategorias />
              </AdminPage>
            }
          />
          <Route
            path="/admin/categorias/crear"
            element={
              <AdminPage>
                <CrearCategorias />
              </AdminPage>
            }
          />
          <Route
            path="/admin/categorias/editar/:id"
            element={
              <AdminPage>
                <EditarCategorias />
              </AdminPage>
            }
          />

          {/* Productos Admin */}
          <Route
            path="/admin/productos"
            element={
              <AdminPage>
                <ListProduct />
              </AdminPage>
            }
          />

          {/* Usuarios Admin */}
          <Route
            path="/admin/usuarios"
            element={
              <AdminPage>
                <ListUsers />
              </AdminPage>
            }
          />
          <Route
            path="/admin/usuarios/crear"
            element={
              <AdminPage>
                <CreateUser />
              </AdminPage>
            }
          />
          <Route
            path="/admin/usuarios/editar/:id"
            element={
              <AdminPage>
                <EditUser />
              </AdminPage>
            }
          />
          <Route
            path="/admin/productos/crear"
            element={
              <AdminPage>
                <CreateProduct />
              </AdminPage>
            }
          />
          <Route
            path="/admin/productos/editar/:id"
            element={
              <AdminPage>
                <EditProduct />
              </AdminPage>
            }
          />

          {/* Pedidos Admin */}
          <Route
            path="/admin/pedidos"
            element={
              <AdminPage>
                <ListOrders />
              </AdminPage>
            }
          />
          <Route
            path="/admin/pedidos/editar/:id"
            element={
              <AdminPage>
                <EditOrder />
              </AdminPage>
            }
          />

          {/* Reseñas Admin */}
          <Route
            path="/admin/resenas"
            element={
              <AdminPage>
                <ListReviews />
              </AdminPage>
            }
          />
          <Route
            path="/admin/resenas/editar/:id"
            element={
              <AdminPage>
                <EditReview />
              </AdminPage>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
