import React, { useState, useEffect } from "react";
import "./panel.css";
import { FaPaw } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const cloudName = "dukljwnwm";
const uploadPreset = "Mascotas";

const ImageUploader = ({ onImageUpload }) => {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      onImageUpload(response.data.secure_url);
    } catch (error) {
      console.error("Error al subir la imagen", error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
};

const AdminPanel = () => {
  const [mascotas, setMascotas] = useState([]);
  const [formData, setFormData] = useState({
    Nombre: "",
    Especie: "",
    Edad: "",
    Sexo: "",
    Descripcion: "",
    Telefono: "",
    CodRefugio: "",
    ImagenUrl: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [changes, setChanges] = useState(false);
  const [codigosRefugio, setCodigosRefugio] = useState([]);
  const [filtroRefugio, setFiltroRefugio] = useState("");
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  useEffect(() => {
    fetchMascotas();
    fetchCodigosRefugio();
  }, []);

  const fetchMascotas = () => {
    axios
    .get(`${baseURL}/api/mascotas`)
      .then((response) => {
        console.log("Datos completos recibidos en el cliente:", response.data);
        setMascotas(response.data);
      })
      .catch((error) => console.error("Error al obtener mascotas:", error));
  };

  const fetchCodigosRefugio = () => {
    axios
     .get(`${baseURL}/api/refugios/codigos`)
      .then((response) => {
        setCodigosRefugio(response.data);
      })
      .catch((error) =>
        console.error("Error al obtener códigos de refugio:", error)
      );
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEdad = (edad) => {
    const edadRegex = /^(\d+)\s*(años?|meses?|días?)?$/i;
    return edadRegex.test(edad);
  };

  const handleImageUpload = (url) => {
    setImageUrl(url);
    setFormData((prev) => ({ ...prev, ImagenUrl: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEdad(formData.Edad)) {
      setError(
        'Formato de edad inválido. Use por ejemplo "2 años" o "9 meses".'
      );
      return;
    }

    const url = editingId
    ? `${baseURL}/api/mascotas/${editingId}`
    : `${baseURL}/api/mascotas`;

    const method = editingId ? "put" : "post";
    const dataToSend = {
      nombre: formData.Nombre,
      especie: formData.Especie,
      edad: formData.Edad,
      sexo: formData.Sexo,
      descripcion: formData.Descripcion,
      numero_contacto: formData.Telefono,
      cod_refugio: formData.CodRefugio,
      imagen_url: formData.ImagenUrl || null,
    };

    try {
      await axios({
        method: method,
        url: url,
        data: dataToSend,
        headers: { "Content-Type": "application/json" },
      });

      setFormData({
        Nombre: "",
        Especie: "",
        Edad: "",
        Sexo: "",
        Descripcion: "",
        Telefono: "",
        CodRefugio: "",
        ImagenUrl: "",
      });
      setImageUrl("");
      setEditingId(null);
      fetchMascotas();
      setError(null);
      setChanges(true);
      toast.success(editingId ? "Actualizado" : "Agregado", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: { backgroundColor: "#87CEEB", color: "#000", fontSize: "18px" },
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error(
        error.response?.data?.message ||
          "Ocurrió un error al guardar",
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          style: {
            backgroundColor: "#FF6347",
            color: "#000",
            fontSize: "18px",
          },
        }
      );
    }
  };

  const handleEdit = (mascota) => {
    setFormData({
      Nombre: mascota.nombre,
      Especie: mascota.especie,
      Edad: mascota.edad,
      Sexo: mascota.sexo,
      Descripcion: mascota.descripcion,
      Telefono: mascota.numero_contacto || "",
      CodRefugio: mascota.cod_refugio,
      ImagenUrl: mascota.imagen_url || "",
    });
    setImageUrl(mascota.imagen_url || "");
    setEditingId(mascota.id);
  };

  const handleDelete = (id) => {
    axios
      .delete(`${baseURL}/api/mascotas/${id}`)
      .then(() => {
        fetchMascotas();
        setChanges(true);
        toast.info("eliminado correctamente", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          style: {
            backgroundColor: "#87CEEB",
            color: "#000",
            fontSize: "18px",
          },
        });
      })
      .catch((error) => {
        console.error("Error al eliminar:", error);
        toast.error("Error al eliminar", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          style: {
            backgroundColor: "#FF6347",
            color: "#000",
            fontSize: "18px",
          },
        });
      });
  };

  const handleSaveAndLogout = () => {
    if (changes) {
      toast.success("Guardando cambios...", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: { backgroundColor: "#87CEEB", color: "#000", fontSize: "18px" },
      });
    }
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  };

  const handleFiltroChange = (e) => {
    setFiltroRefugio(e.target.value);
  };

  const mascotasFiltradas = mascotas.filter(
    (mascota) => filtroRefugio === "" || mascota.cod_refugio === filtroRefugio
  );

  return (
    <div className="container">
      <button className="save-logout-button" onClick={handleSaveAndLogout}>
        Guardar cambios y cerrar sesión
      </button>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="titulo-container">
        <FaPaw className="patita" />
        <h2>Panel de Administracion</h2>
        <FaPaw className="patita2" />
      </div>
      <div className="titulo2">
        <h3>{editingId ? "Modificar" : "Añadir"} </h3>
      </div>
      {error && <div className="error-message">{error}</div>}
      <form className="form" onSubmit={handleSubmit}>
        <input
          className="input"
          name="CodRefugio"
          value={formData.CodRefugio}
          onChange={handleInputChange}
          placeholder="Código de Refugio"
          required
        />
        <input
          className="input"
          name="Nombre"
          value={formData.Nombre}
          onChange={handleInputChange}
          placeholder="Nombre"
          required
        />
        <select
          className="input"
          name="Especie"
          value={formData.Especie}
          onChange={handleInputChange}
          required
        >
          <option value="">Seleccione especie</option>
          <option value="Canina">Canino</option>
          <option value="Felina">Felino</option>
        </select>
        <input
          className="input"
          name="Edad"
          value={formData.Edad}
          onChange={handleInputChange}
          placeholder="Edad (ej. 2 años, 9 meses)"
          required
        />
        <select
          className="input"
          name="Sexo"
          value={formData.Sexo}
          onChange={handleInputChange}
          required
        >
          <option value="">Seleccione sexo</option>
          <option value="Hembra">Hembra</option>
          <option value="Macho">Macho</option>
        </select>
        <textarea
          className="textarea"
          name="Descripcion"
          value={formData.Descripcion}
          onChange={handleInputChange}
          placeholder="Descripción"
          required
        />
        <input
          className="input"
          name="Telefono"
          value={formData.Telefono}
          onChange={handleInputChange}
          placeholder="Número de contacto"
        />
        <ImageUploader onImageUpload={handleImageUpload} />
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Preview"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        )}
        <button className="submit-button" type="submit">
          {editingId ? "Actualizar" : "Añadir"} 
        </button>
      </form>
      <div className="mascotas-list">
        <div className="lista-header">
          <h3>Listado de animales</h3>
          <div className="filtro-container">
            <label htmlFor="filtroRefugio">Filtrar por código: </label>
            <select
              id="filtroRefugio"
              value={filtroRefugio}
              onChange={handleFiltroChange}
            >
              <option value="">Todos</option>
              {codigosRefugio.map((codigo) => (
                <option key={codigo} value={codigo}>
                  {codigo}
                </option>
              ))}
            </select>
          </div>
        </div>
        {mascotasFiltradas.map((mascota) => (
          <div className="mascota-item" key={mascota.id}>
            {mascota.imagen_url && (
              <img
                src={mascota.imagen_url}
                alt={mascota.nombre}
                className="mascota-thumbnail"
              />
            )}
            <div className="mascota-info">
              <p>
                <strong>Cod:</strong> {mascota.cod_refugio || "No disponible"}
              </p>
              <p>
                <strong>Nombre:</strong> {mascota.nombre || "No disponible"}
              </p>
              <p>
                <strong>Edad:</strong> {mascota.edad || "No disponible"}
              </p>
              <p>
                <strong>Sexo:</strong> {mascota.sexo || "No disponible"}
              </p>
            </div>
            <div className="button-group">
              <button
                className="edit-button"
                onClick={() => handleEdit(mascota)}
              >
                Editar
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(mascota.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;


/*import React, { useState, useEffect } from 'react';
import './panel.css';
import { FaPaw } from 'react-icons/fa';
import axios from 'axios';

const cloudName = 'dukljwnwm';
const uploadPreset = 'Mascotas';

const ImageUploader = ({ onImageUpload }) => {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      onImageUpload(response.data.secure_url);
    } catch (error) {
      console.error('Error al subir la imagen', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
};

const AdminPanel = () => {
  const [mascotas, setMascotas] = useState([]);
  const [formData, setFormData] = useState({
    Nombre: '',
    Especie: '',
    Edad: '',
    Sexo: '',
    Descripcion: '',
    Telefono: '',
    CodRefugio: '',
    ImagenUrl: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchMascotas();
  }, []);

  const fetchMascotas = () => {
    axios.get('http://localhost:5000/api/mascotas')
      .then(response => {
        console.log('Datos completos recibidos en el cliente:', response.data);
        setMascotas(response.data);
      })
      .catch(error => console.error('Error al obtener mascotas:', error));
  };
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEdad = (edad) => {
    const edadRegex = /^(\d+)\s*(años?|meses?|días?)?$/i;
    return edadRegex.test(edad);
  };

  const handleImageUpload = (url) => {
    setImageUrl(url);
    setFormData(prev => ({ ...prev, ImagenUrl: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEdad(formData.Edad)) {
      setError('Formato de edad inválido. Use por ejemplo "2 años" o "9 meses".');
      return;
    }
  
    const url = editingId 
      ? `http://localhost:5000/api/mascotas/${editingId}`
      : 'http://localhost:5000/api/mascotas';

    const method = editingId ? 'put' : 'post';
    const dataToSend = {
      nombre: formData.Nombre,
      especie: formData.Especie,
      edad: formData.Edad,
      sexo: formData.Sexo,
      descripcion: formData.Descripcion,
      numero_contacto: formData.Telefono,
      cod_refugio: formData.CodRefugio,
      imagen_url: formData.ImagenUrl || null 
    };

    try {
      await axios({
        method: method,
        url: url,
        data: dataToSend,  
        headers: { 'Content-Type': 'application/json' }
      });
    
      setFormData({
        Nombre: '',
        Especie: '',
        Edad: '',
        Sexo: '',
        Descripcion: '',
        Telefono: '',
        CodRefugio: '',
        ImagenUrl: ''
      });
      setImageUrl('');
      setEditingId(null);
      fetchMascotas();
      setError(null);
      setMessage(editingId ? "Mascota actualizada" : "Mascota agregada");
    } catch (error) {
      console.error('Error al guardar la mascota:', error);
      setError(error.response?.data?.message || 'Ocurrió un error al guardar la mascota');
    }
  };

  const handleEdit = (mascota) => {
    setFormData({
      Nombre: mascota.nombre,
      Especie: mascota.especie,
      Edad: mascota.edad,
      Sexo: mascota.sexo,
      Descripcion: mascota.descripcion,
      Telefono: mascota.numero_contacto || '',
      CodRefugio: mascota.cod_refugio,
      ImagenUrl: mascota.imagen_url || ''
    });
    setImageUrl(mascota.imagen_url || '');
    setEditingId(mascota.id);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/api/mascotas/${id}`)
      .then(() => {
        fetchMascotas();
        setMessage("Mascota eliminada");
      })
      .catch(error => console.error('Error al eliminar la mascota:', error));
  };

  return (
    <div className="container">
      <div className="titulo-container">
        <FaPaw className="patita" />
        <h2>Administración de Mascotas</h2>
        <FaPaw className="patita2" />
      </div>
      <div className='titulo2'> 
        <h3>{editingId ? 'Modificar' : 'Añadir'} Mascota</h3>
      </div>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      <form className="form" onSubmit={handleSubmit}>
        <input className="input" name="CodRefugio" value={formData.CodRefugio} onChange={handleInputChange} placeholder="Código de Refugio" required />
        <input className="input" name="Nombre" value={formData.Nombre} onChange={handleInputChange} placeholder="Nombre" required />
        <select className="input" name="Especie" value={formData.Especie} onChange={handleInputChange} required>
          <option value="">Seleccione especie</option>
          <option value="Canina">Canina</option>
          <option value="Felina">Felina</option>
        </select>
        <input className="input" name="Edad" value={formData.Edad} onChange={handleInputChange} placeholder="Edad (ej. 2 años, 9 meses)" required />
        <select className="input" name="Sexo" value={formData.Sexo} onChange={handleInputChange} required>
          <option value="">Seleccione sexo</option>
          <option value="Hembra">Hembra</option>
          <option value="Macho">Macho</option>
        </select>
        <textarea className="textarea" name="Descripcion" value={formData.Descripcion} onChange={handleInputChange} placeholder="Descripción" required />
        <input className="input" name="Telefono" value={formData.Telefono} onChange={handleInputChange} placeholder="Número de contacto" />
        <ImageUploader onImageUpload={handleImageUpload} />
        {imageUrl && (
          <img src={imageUrl} alt="Preview" style={{width: '100px', height: '100px', objectFit: 'cover'}} />
        )}
        <button className="submit-button" type="submit">
          {editingId ? 'Actualizar' : 'Añadir'} Mascota
        </button>
      </form>
      <div className="mascotas-list">
  <h3>Listado de mascotas</h3>
  {mascotas.map((mascota) => (
    <div className="mascota-item" key={mascota.id}>
      {mascota.imagen_url && (
        <img src={mascota.imagen_url} alt={mascota.nombre} className="mascota-thumbnail" />
      )}
      <div className="mascota-info">
        <p><strong>Cod:</strong> {mascota.cod_refugio || 'No disponible'}</p>
        <p><strong>Nombre:</strong> {mascota.nombre || 'No disponible'}</p>
        <p><strong>Edad:</strong> {mascota.edad || 'No disponible'}</p>
        <p><strong>Sexo:</strong> {mascota.sexo || 'No disponible'}</p>
        
      </div>
      <div className="button-group">
        <button className="edit-button" onClick={() => handleEdit(mascota)}>Editar</button>
        <button className="delete-button" onClick={() => handleDelete(mascota.id)}>Eliminar</button>
      </div>
    </div>
  ))}
</div>
</div>
  );
};



export default AdminPanel; */