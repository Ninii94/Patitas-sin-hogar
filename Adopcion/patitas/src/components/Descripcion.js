import Navbar from './Navbar';
import './descripcion.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const MascotaDetalle = () => {
  const [mascota, setMascota] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchMascota = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/mascotas/${id}`);
        setMascota(response.data);
      } catch (error) {
        setError('Error al cargar la información de la mascota. Por favor, intente nuevamente más tarde.');
      }
    };
    fetchMascota();
  }, [id]);

  if (error) return <div className="error-message">{error}</div>;
  if (!mascota) return <div className="loading-message">Cargando información de la mascota...</div>;
  return (
    <div className="pagina-contenedor">
      <Navbar />
      <div className="mascota-detalle-pagina">
        <div className="mascota-detalle-contenedor">
          <div className="mascota-imagenes-contenedor">
            {mascota.imagen_url ? (
              <img src={mascota.imagen_url} alt={mascota.nombre} className="mascota-imagen-principal" />
            ) : (
              <p>No hay imagen disponible</p>
            )}
          </div>
          <div className="mascota-info-contenedor">
            <h1 className="mascota-nombre">{mascota.nombre}</h1>
            <h5 className='mascota-codigo'>Cod: {mascota.cod_refugio}</h5>
            <div className="mascota-detalles">
              <p><strong>Especie:</strong> {mascota.especie}</p>
              <p><strong>Edad:</strong> {mascota.edad}</p>
              <p><strong>Sexo:</strong> {mascota.sexo}</p>
              <p><strong>Más sobre mí:</strong> {mascota.descripcion}</p>
            </div>
            <p className="whatsapp">
              Envía un WhatsApp al {mascota.numero_contacto} preguntando por {mascota.nombre}!
            </p>
            <div className="button-container">
              <Link to="/adoptar" className="volver-btn">Volver al listado</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MascotaDetalle;