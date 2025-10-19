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
import Checkout from '@/pages/App/Checkout/Checkout';
import MisPedidos from '@/pages/App/Pedidos/MisPedidos';
import VerPedido from '@/pages/App/Pedidos/VerPedido';

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
import ListSales from '@/pages/Admin/Ventas/ListSales';
import EditSale from '@/pages/Admin/Ventas/EditSale';
import PendingPayments from '@/pages/Admin/Ventas/PendingPayments';
import ListNotifications from '@/pages/Admin/Notificaciones/ListNotifications';
import EditNotification from '@/pages/Admin/Notificaciones/EditNotification';
import CreateNotification from '@/pages/Admin/Notificaciones/CreateNotification';
import ListShipments from '@/pages/Admin/Envíos/ListShipments';
import EditShipment from '@/pages/Admin/Envíos/EditShipment';

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
          <Route path="/pedidos" element={<MisPedidos />} />
          <Route path="/pedidos/:id" element={<VerPedido />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />

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

          {/* Ventas (Transacciones) Admin */}
          <Route
            path="/admin/ventas"
            element={
              <AdminPage>
                <ListSales />
              </AdminPage>
            }
          />
          <Route
            path="/admin/ventas/pendientes"
            element={
              <AdminPage>
                <PendingPayments />
              </AdminPage>
            }
          />
          <Route
            path="/admin/ventas/editar/:id"
            element={
              <AdminPage>
                <EditSale />
              </AdminPage>
            }
          />

          {/* Notificaciones Admin */}
          <Route
            path="/admin/notificaciones"
            element={
              <AdminPage>
                <ListNotifications />
              </AdminPage>
            }
          />
          <Route
            path="/admin/notificaciones/crear"
            element={
              <AdminPage>
                <CreateNotification />
              </AdminPage>
            }
          />
          <Route
            path="/admin/notificaciones/editar/:id"
            element={
              <AdminPage>
                <EditNotification />
              </AdminPage>
            }
          />

          {/* Envíos Admin */}
          <Route
            path="/admin/envios"
            element={
              <AdminPage>
                <ListShipments />
              </AdminPage>
            }
          />
          <Route
            path="/admin/envios/editar/:id"
            element={
              <AdminPage>
                <EditShipment />
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
