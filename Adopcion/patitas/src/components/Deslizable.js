import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { FaPaw, FaTimes } from "react-icons/fa";
import cachorros from "../images/Cachorros.png";

const Deslizable = () => {
  const [mascotas, setMascotas] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAviso, setShowAviso] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMascotasRecientes = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${baseURL}/api/mascotas/recientes`);
        console.log('Datos recibidos:', response.data);
        setMascotas(response.data);
      } catch (error) {
        console.error('Error al obtener mascotas recientes:', error);
      }
    };

    fetchMascotasRecientes();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.max(mascotas.length - 3, 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + Math.max(mascotas.length - 3, 1)) % Math.max(mascotas.length - 3, 1));
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [mascotas.length]);

  const handleMouseDown = (e) => {
    const startX = e.pageX - carouselRef.current.offsetLeft;
    const scrollLeft = carouselRef.current.scrollLeft;

    const handleMouseMove = (e) => {
      const x = e.pageX - carouselRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const handleMascotaClick = (mascota) => {
    setSelectedMascota(mascota);
    setShowAviso(true);
  };

  const closeAviso = () => {
    setShowAviso(false);
    setSelectedMascota(null);
  };

  const AvisoFullscreen = ({ mascota, onClose }) => (
    <div className="aviso-fullscreen">
      <div className="aviso-content">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className="aviso-title">ANTES DE ADOPTAR</h2>
        <p className="aviso-description">
          Adoptar no es solo darles un techo, sino brindarles un verdadero hogar, con los cuidados y el amor que
          merecen. Es una decisión que no debe tomarse a la ligera, sino con plena consciencia de la
          responsabilidad que conlleva. Sin embargo, la recompensa de ofrecerles una segunda oportunidad es
          invaluable.
        </p>
        <h3 className="requisitos-title">REQUISITOS DE ADOPCIÓN</h3>
        <div className="requisitos-container">
          <div className="requisitos-column">
            <div className="requisito-item">
              <FaPaw className="paw-icon" />
              <p>El hogar debe contar con los recursos económicos para cubrir los gastos de alimentación, atención médica y otros cuidados necesarios.</p>
            </div>
            <div className="requisito-item">
              <FaPaw className="paw-icon" />
              <p>No se entregarán animales a menores de edad sin el consentimiento y supervisión de un adulto responsable.</p>
            </div>
            <div className="requisito-item">
              <FaPaw className="paw-icon" />
              <p>Se realizará un seguimiento post-adopción para asegurarnos de que el animal se encuentra en buenas condiciones.</p>
            </div>
          </div>
          <div className="requisitos-column">
            <img src={cachorros} alt="Cachorros" className="cachorros-image" />
          </div>
          <div className="requisitos-column">
            <div className="requisito-item">
              <FaPaw className="paw-icon" />
              <p>Los animales mayores de 6 meses se entregarán castrados. En el caso de adoptar un cachorro más joven, el adoptante se compromete a castrarlo entre los 6 y 12 meses de edad, de manera obligatoria.</p>
            </div>
            <div className="requisito-item">
              <FaPaw className="paw-icon" />
              <p>La asociación que albergue al animal se reserva el derecho de aprobar o rechazar una postulación según sus valores y criterios.</p>
            </div>
            <div className="requisito-item">
              <FaPaw className="paw-icon" />
              <p>Los adoptantes deberán comprometerse a nunca abandonar al animal y devolverlo si no pueden seguir cuidándolo.</p>
            </div>
          </div>
        </div>
        <p className="aviso-footer">
          Si estás preparado para asumir este desafío lleno de amor, es hora de dar el siguiente paso. Juntos podremos hacer realidad el sueño de una segunda oportunidad para uno de nuestros residentes y darle la bienvenida a un compañero incondicional en tu vida.
        </p>
        <button className="conocelos-btn" onClick={() => navigate(`/mascota/${mascota.id}`)}>
          <FaPaw /> ¡Adoptar!
        </button>
      </div>
    </div>
  );


  return (
    <div className="carousel-container">
      <h2>Ultimos amigos añadidos</h2>
      <div className="carousel-wrapper">
        <button className="carousel-button prev" onClick={prevSlide}>
          &#10094;
        </button>
        <div
          className="carousel"
          ref={carouselRef}
          onMouseDown={handleMouseDown}
        >
          {mascotas.slice(currentIndex, currentIndex + 4).map((mascota) => (
            <div 
              key={mascota.id} 
              className="carousel-item"
              onClick={() => handleMascotaClick(mascota)}
            >
              <img src={mascota.imagen_url} alt={mascota.nombre} />
              <p>{mascota.nombre}</p>
            </div>
          ))}
        </div>
        <button className="carousel-button next" onClick={nextSlide}>
          &#10095;
        </button>
      </div>
      <Link to="/prepagina" className="ver-mas-btn">
        Ver más <FaPaw className="pata" />
      </Link>
      {showAviso && selectedMascota && (
        <AvisoFullscreen mascota={selectedMascota} onClose={closeAviso} />
      )}
    </div>
  );
};

export default Deslizable;
/*import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import mascota1 from '../images/mascota1.jpg';
import mascota2 from '../images/mascota2.jpg';
import mascota3 from '../images/mascota3.jpg';
import mascota4 from '../images/mascota4.jpg';
import mascota5 from '../images/mascota5.jpg';
import mascota6 from '../images/mascota6.jpg';
import mascota7 from '../images/mascota7.jpg';

const Deslizable = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  const mascotas = [
    { id: 1, imagen: mascota1 },
    { id: 2, imagen: mascota2 },
    { id: 3, imagen: mascota3 },
    { id: 4, imagen: mascota4 },
    { id: 5, imagen: mascota5 },
    { id: 6, imagen: mascota6 },
    { id: 7, imagen: mascota7 },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (mascotas.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + (mascotas.length - 3)) % (mascotas.length - 3));
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e) => {
    const startX = e.pageX - carouselRef.current.offsetLeft;
    const scrollLeft = carouselRef.current.scrollLeft;

    const handleMouseMove = (e) => {
      const x = e.pageX - carouselRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="carousel-container">
      <h2>Últimas mascotas subidas</h2>
      <div className="carousel-wrapper">
        <button className="carousel-button prev" onClick={prevSlide}>&#10094;</button>
        <div 
          className="carousel" 
          ref={carouselRef}
          onMouseDown={handleMouseDown}
        >
          {mascotas.slice(currentIndex, currentIndex + 4).map((mascota) => (
            <div key={mascota.id} className="carousel-item">
             <img src={mascota.imagen} alt={`Mascota ${mascota.id}`} />
            </div>
          ))}
        </div>
        <button className="carousel-button next" onClick={nextSlide}>&#10095;</button>
      </div>
      <Link to="/prepagina" className="ver-mas-btn">Ver más</Link>
    </div>
  );
};

export default Deslizable; */