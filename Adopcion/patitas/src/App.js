import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import PrePagina from './pages/PrePagina';
import Login from './pages/Login';
import './styles.css';
import Adoptar from './pages/Adoptar';
import AdminPanel from './components/AdminPanel';
import Contacto from './pages/Contacto';
import HogarDeTransito from './pages/HogarDeTransito';
import MascotaDetalle from './components/Descripcion';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prepagina" element={<PrePagina />} />
        <Route path="/adoptar" element={<Adoptar />} /> 
        <Route path="/mascota/:id" element={<MascotaDetalle />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/hogar-de-transito" element={<HogarDeTransito />} />
        
      </Routes>
    </Router>
  );
}
export default App;