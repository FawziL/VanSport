import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Login from "./pages/auth/Login";
import Navbar from "@/components/Navbar";

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Otras rutas */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
