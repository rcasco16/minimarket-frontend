import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Caja from './components/Caja'
import Inventario from './components/Inventario'
import CierreCaja from './components/CierreCaja'
import Reportes from './components/Reportes'
import Personal from './components/Personal'
import RegistroEmpresa from './components/RegistroEmpresa';
// 👇 Importamos la Landing que creamos
import LandingPage from './components/LandingPage'; 

function App() {
  const [usuarioActivo, setUsuarioActivo] = useState(null)
  const [productos, setProductos] = useState([])
  const [vistaActual, setVistaActual] = useState('caja')
  const [menuColapsado, setMenuColapsado] = useState(false)
  const [mostrarLanding, setMostrarLanding] = useState(true) // 👇 Para mostrar la publicidad primero

  const cerrarSesion = () => {
    localStorage.removeItem('tokenMinimarket')
    setUsuarioActivo(null)
    setProductos([])
    setMostrarLanding(true)
  }

  // 👇 FUNCIÓN PARA ENTRAR COMO DEMO
  const entrarComoDemo = () => {
    const usuarioDemo = {
      id: 999,
      nombre: "Visitante de Prueba",
      rol: "admin",
      empresa_id: 1, // Usamos los datos de tu empresa principal para que vean productos reales
      esDemo: true
    };
    setUsuarioActivo(usuarioDemo);
    setMostrarLanding(false);
  }

  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem('tokenMinimarket');
      const empresaId = usuarioActivo.empresa_id;
      
      // Si es demo, podemos usar un token público o saltar la verificación si el backend lo permite
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

  // 1. RUTA PARA REGISTRO DE NUEVAS EMPRESAS
  if (window.location.pathname === '/master-rc') {
    return <RegistroEmpresa />
  }

  // 2. MOSTRAR LANDING PAGE (Publicidad)
  if (mostrarLanding && !usuarioActivo) {
    return <LandingPage 
              onIrAlLogin={() => setMostrarLanding(false)} 
              onProbarDemo={entrarComoDemo} 
           />
  }

  // 3. SI NO HAY USUARIO PERO YA PASÓ LA LANDING, MOSTRAR LOGIN
  if (!usuarioActivo) {
    return <Login onLoginExitoso={setUsuarioActivo} onVolver={() => setMostrarLanding(true)} />
  }

  // 4. SISTEMA PRINCIPAL
  return (
    <div className={`app-layout ${usuarioActivo.esDemo ? 'modo-demo' : ''}`}>
      {/* Marcador de que es una DEMO */}
      {usuarioActivo.esDemo && (
        <div style={{ backgroundColor: '#f59e0b', color: 'black', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', padding: '5px' }}>
          ⚠️ ESTÁS EN MODO DEMO - Los cambios no se guardarán permanentemente.
        </div>
      )}

      <Sidebar
        usuarioActivo={usuarioActivo}
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        cerrarSesion={cerrarSesion}
        menuColapsado={menuColapsado}
        setMenuColapsado={setMenuColapsado}
      />

      <main className="main-content">
        {vistaActual === 'caja' && <Caja productos={productos} usuarioActivo={usuarioActivo} cargarProductos={cargarProductos} />}
        {vistaActual === 'cierre' && <CierreCaja usuarioActivo={usuarioActivo} />}
        {vistaActual === 'inventario' && <Inventario productos={productos} usuarioActivo={usuarioActivo} cargarProductos={cargarProductos} />}
        {vistaActual === 'reportes' && <Reportes usuarioActivo={usuarioActivo} />}
        {vistaActual === 'personal' && <Personal usuarioActivo={usuarioActivo} />}
      </main>

      <div className="mobile-footer">
        <p style={{ margin: '0 0 10px 0', color: 'var(--text-dim)' }}>
          {usuarioActivo.esDemo ? '🚀 Probando Sistema' : `👤 ${usuarioActivo.nombre}`}
        </p>
        <button className="btn-danger" style={{ width: '100%', maxWidth: '300px' }} onClick={cerrarSesion}>
          {usuarioActivo.esDemo ? 'Finalizar Demo' : 'Salir'}
        </button>
      </div>
    </div>
  )
}

export default App