import { useState } from 'react';

// Recibimos una "prop" (propiedad) llamada onLoginExitoso desde App.jsx
function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const iniciarSesion = async (e) => {
    e.preventDefault();
    try {
      // 👇 ACÁ ESTÁ LA URL ACTUALIZADA 👇
      const respuesta = await fetch('https://api-minimarket-rc.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const datos = await respuesta.json();

      if (respuesta.ok) {
        localStorage.setItem('tokenMinimarket', datos.token);
        // ¡Magia! Le avisamos a App.jsx que el login fue un éxito y le pasamos los datos
        onLoginExitoso(datos.usuario); 
      } else {
        setMensaje(datos.mensaje);
      }
    } catch (error) {
      setMensaje('Error al conectar con el servidor');
    }
  };

  return (
    <div className="login-container">
      <h1>Sistema de Caja</h1>
      <h2 style={{ color: 'var(--text-dim)', marginTop: '10px' }}>RC Creación de Software</h2>
      <form onSubmit={iniciarSesion} className="login-form">
        <input 
          type="email" 
          placeholder="Correo Electrónico" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" className="btn-primary">Ingresar</button>
      </form>
      {mensaje && <p style={{ color: 'var(--danger)', marginTop: '15px' }}><strong>{mensaje}</strong></p>}
    </div>
  );
}

export default Login;