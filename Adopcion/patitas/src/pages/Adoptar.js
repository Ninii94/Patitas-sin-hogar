import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import PatitaLoading from '../components/PatitaLoading';
import './adoptar.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://patitas-sin-hogar.onrender.com';

const MascotaCard = ({ id, nombre, especie, sexo, imagen_url }) => (
  <Link to={`/mascota/${id}`} className="mascota-card">
    {imagen_url && <img src={imagen_url} alt={nombre} className="mascota-imagen" />}
    <h3>{nombre}</h3>
    <p>{`${especie} (${sexo})`}</p>
  </Link>
);

const Adoptar = () => {
  const [mascotas, setMascotas] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${baseURL}/api/mascotas`);
        console.log('Datos recibidos:', response.data);
        setMascotas(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener mascotas:', error);
        setError('Error al cargar las mascotas. Por favor, intente nuevamente más tarde.');
        setLoading(false);
      }
    };
    fetchMascotas();
  }, []);

  const mascotasFiltradas = mascotas && mascotas.length > 0 
    ? (filtro === 'todos'
        ? mascotas
        : mascotas.filter(mascota => {
            const tipo = `${mascota.especie?.toLowerCase()}_${mascota.sexo?.toLowerCase()}`;
            return tipo === filtro;
          }))
    : [];

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="adoptar-page">
      <Navbar />
      <div className="filtro-container">
        <button className="filtro-btn" onClick={() => setFiltro('todos')}>
          <FaFilter /> Todos
        </button>
        <button className="filtro-btn" onClick={() => setFiltro('canina_macho')}>Perrito</button>
        <button className="filtro-btn" onClick={() => setFiltro('canina_hembra')}>Perrita</button>
        <button className="filtro-btn" onClick={() => setFiltro('felina_macho')}>Gatito</button>
        <button className="filtro-btn" onClick={() => setFiltro('felina_hembra')}>Gatita</button>
      </div>
      {loading && <PatitaLoading /> }
      
        <div className="mascotas-grid">
          {mascotasFiltradas.map(mascota => (
            <MascotaCard
              key={mascota.id}
              id={mascota.id}
              nombre={mascota.nombre}
              especie={mascota.especie}
              sexo={mascota.sexo}
              imagen_url={mascota.imagen_url}
            />
          ))}
        </div>
    </div>
  );
};

export default Adoptar;



/*/import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

import { FaFilter } from 'react-icons/fa';
import './adoptar.css';

const MascotaCard = ({ id, nombre, especie, sexo, imagen_url }) => (
  <Link to={`/mascota/${id}`} className="mascota-card">
    {imagen_url && <img src={imagen_url} alt={nombre} className="mascota-imagen" />}
    <h3>{nombre}</h3>
    <p>{`${especie} (${sexo})`}</p>
  </Link>
);
const Adoptar = () => {
  const [mascotas, setMascotas] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/mascotas');
        console.log('Datos recibidos:', response.data); // Para depuración
        setMascotas(response.data);
      } catch (error) {
        console.error('Error al obtener mascotas:', error);
        setError('Error al cargar las mascotas. Por favor, intente nuevamente más tarde.');
      }
    };
    fetchMascotas();
  }, []);

  const mascotasFiltradas = mascotas && mascotas.length > 0 
    ? (filtro === 'todos'
        ? mascotas
        : mascotas.filter(mascota => {
            const tipo = `${mascota.especie?.toLowerCase()}_${mascota.sexo?.toLowerCase()}`;
            return tipo === filtro;
          }))
    : [];

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="adoptar-page">
      <Navbar />
      <div className="filtro-container">
        <button className="filtro-btn" onClick={() => setFiltro('todos')}>
          <FaFilter /> Todos
        </button>
        <button className="filtro-btn" onClick={() => setFiltro('canina_macho')}>Perrito</button>
        <button className="filtro-btn" onClick={() => setFiltro('canina_hembra')}>Perrita</button>
        <button className="filtro-btn" onClick={() => setFiltro('felina_macho')}>Gatito</button>
        <button className="filtro-btn" onClick={() => setFiltro('felina_hembra')}>Gatita</button>
      </div>
      {mascotas.length === 0 ? (
        <p>Buscando tu amigo ideal...</p>
      ) : (
        <div className="mascotas-grid">
          {mascotasFiltradas.map(mascota => (
            <MascotaCard
              key={mascota.id}
              id={mascota.id}
              nombre={mascota.nombre}
              especie={mascota.especie}
              sexo={mascota.sexo}
              imagen_url={mascota.imagen_url}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Adoptar;
*/