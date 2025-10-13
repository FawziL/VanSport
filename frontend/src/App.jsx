import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import Navbar from '@/components/Navbar';
import NotFound from '@/pages/App/NotFound';
import Home from '@/pages/App/Home/Home';
import Productos from '@/pages/App/Productos/Productos';
import VerProducto from '@/pages/App/Productos/VerProducto';
import Dashboard from '@/pages/Admin/Dashboard/Dashboard';
import AdminPage from '@/pages/Admin/AdminPage';
import Perfil from '@/pages/App/Perfil/Perfil';
import Carrito from '@/pages/App/Carrito/Carrito';

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
          {/* <Route
            path="/admin/productos"
            element={
              <AdminPage>
                <AdminProductos />
              </AdminPage>
            }
          /> */}

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
