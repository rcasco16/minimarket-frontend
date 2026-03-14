import { useState, useEffect } from 'react'
import './App.css'

// Importamos nuestros componentes modulares
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Caja from './components/Caja'
import Inventario from './components/Inventario'
import CierreCaja from './components/CierreCaja'
import Reportes from './components/Reportes'
import Personal from './components/Personal'
import RegistroEmpresa from './components/RegistroEmpresa';

function App() {
  const [usuarioActivo, setUsuarioActivo] = useState(null)
  const [productos, setProductos] = useState([])
  const [vistaActual, setVistaActual] = useState('caja')
  const [menuColapsado, setMenuColapsado] = useState(false)

  const cerrarSesion = () => {
    localStorage.removeItem('tokenMinimarket')
    setUsuarioActivo(null)
    setProductos([])
  }

  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem('tokenMinimarket');
      const empresaId = usuarioActivo.empresa_id;
      const respuesta = await fetch(`https://api-minimarket-rc.onrender.com/api/productos/empresa/${empresaId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setProductos(datos);
      }
    } catch (error) { console.error("Error de red:", error); }
  }

  useEffect(() => {
    if (usuarioActivo) cargarProductos();
  }, [usuarioActivo]);

  
  // ==========================================
  // RENDER PRINCIPAL DEL DIRECTOR DE ORQUESTA
  // ==========================================

  // 1. 👇 RUTA SECRETA PARA EL DUEÑO (RC Creación de Software) 👇
  // Si en la URL escribes /master-rc, mostramos el registro sin importar nada más
  if (window.location.pathname === '/master-rc') {
    return <RegistroEmpresa />
  }

  // 2. Si no hay usuario, mostramos el componente Login
  if (!usuarioActivo) {
    return <Login onLoginExitoso={setUsuarioActivo} />
  }

  // 3. Si hay usuario, mostramos el esqueleto de la App
  return (
    <div className="app-layout">

      {/* 1. EL MENÚ LATERAL */}
      <Sidebar
        usuarioActivo={usuarioActivo}
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        cerrarSesion={cerrarSesion}
        menuColapsado={menuColapsado}
        setMenuColapsado={setMenuColapsado}
      />

      {/* 2. EL CONTENIDO CENTRAL */}
      <main className="main-content">

        {vistaActual === 'caja' && (
          <Caja productos={productos} usuarioActivo={usuarioActivo} cargarProductos={cargarProductos} />
        )}

        {vistaActual === 'cierre' && (
          <CierreCaja usuarioActivo={usuarioActivo} />
        )}

        {vistaActual === 'inventario' && (
          <Inventario productos={productos} usuarioActivo={usuarioActivo} cargarProductos={cargarProductos} />
        )}

        
        {vistaActual === 'reportes' && (
          <Reportes usuarioActivo={usuarioActivo} />
        )}

        {vistaActual === 'personal' && (
          <Personal usuarioActivo={usuarioActivo} />
        )}


      </main>

      {/* 3. EL FOOTER MÓVIL */}
      <div className="mobile-footer">
        <p style={{ margin: '0 0 10px 0', color: 'var(--text-dim)' }}>👤 {usuarioActivo.nombre}</p>
        <button className="btn-danger" style={{ width: '100%', maxWidth: '300px' }} onClick={cerrarSesion}>
          Salir
        </button>
      </div>

    </div>
  )
}

export default App