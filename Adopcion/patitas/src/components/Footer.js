import React from 'react';
import { Link } from 'react-router-dom';
import logoCompleto from '../images/logocompleto.png';
import { FaFacebook, FaYoutube, FaInstagram, FaTwitter } from 'react-icons/fa';
import './footer.css';

const Footer = ({ className }) => {
  return (
    <footer className={`footer ${className}`}>
      <div className="footer-content">
        <div className="footer-section logo-section">
          <img src={logoCompleto} alt="Logo Completo" className="footer-logo" />
          <p>Adopta un amigo, cambia una vida</p>
          <h10>Patitas Sin Hogar</h10>
          <Link to="/login" className="admin-link">Administrar</Link>
        </div>
        <div className="footer-section">
          <h3>¡Navega por la web!</h3>
          <nav className="footer-nav">
            <Link to="/" className="footer-link">Inicio</Link>
            <Link to="/adoptar" className="footer-link">Adoptar</Link>
            <Link to="/contacto" className="footer-link">Contacto</Link>
            <Link to="/hogar-de-transito" className="footer-link">Hogar de Tránsito</Link>
          </nav>
        </div>
        <div className="footer-section">
          <h3>Redes Sociales</h3>
          <div className="social-icons">
            <a href="#" className="social-icon"><FaFacebook /> Facebook</a>
            <a href="#" className="social-icon"><FaYoutube /> YouTube</a>
            <a href="#" className="social-icon"><FaInstagram /> Instagram</a>
            <a href="#" className="social-icon"><FaTwitter /> Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;