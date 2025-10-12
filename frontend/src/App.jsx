import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/auth/Login';
import Navbar from '@/components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <>
        <Navbar />
        <main style={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Otras rutas */}
          </Routes>
        </main>
      </>
    </BrowserRouter>
  );
}

export default App;
