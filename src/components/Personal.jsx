import React, { useState, useEffect } from 'react';

function Personal({ usuarioActivo }) {
  const [empleados, setEmpleados] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: '', email: '', password: '', rol: 'cajero'
  });

  const cargarEmpleados = async () => {
    try {
      const token = localStorage.getItem('tokenMinimarket');
      
      // 👇 PRIMERA URL ACTUALIZADA: PARA TRAER EMPLEADOS 👇
      const res = await fetch(`https://api-minimarket-rc.onrender.com/api/usuarios/empresa/${usuarioActivo.empresa_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmpleados(data);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    cargarEmpleados();
  }, [usuarioActivo.empresa_id]);

  const guardarEmpleado = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('tokenMinimarket');
      const empleadoAGuardar = { ...nuevoEmpleado, empresa_id: usuarioActivo.empresa_id };
      
      // 👇 SEGUNDA URL ACTUALIZADA: PARA GUARDAR EMPLEADO 👇
      const res = await fetch('https://api-minimarket-rc.onrender.com/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(empleadoAGuardar)
      });

      if (res.ok) {
        alert('¡Empleado registrado con éxito!');
        setMostrarModal(false);
        setNuevoEmpleado({ nombre: '', email: '', password: '', rol: 'cajero' });
        cargarEmpleados();
      } else {
        const error = await res.json();
        alert(error.mensaje || "Error al guardar");
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👥 Gestión de Personal</h2>
        <button className="btn-primary" onClick={() => setMostrarModal(true)}>+ Nuevo Empleado</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo de Acceso (Email)</th>
              <th>Rol / Permisos</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <tr key={emp.id}>
                <td style={{ fontWeight: 'bold' }}>{emp.nombre}</td>
                <td>{emp.email}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
                    backgroundColor: emp.rol === 'admin' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: emp.rol === 'admin' ? '#60a5fa' : '#34d399'
                  }}>
                    {emp.rol}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Registrar Empleado</h3>
              <button className="btn-close" onClick={() => setMostrarModal(false)}>×</button>
            </div>
            <form onSubmit={guardarEmpleado}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" value={nuevoEmpleado.nombre} onChange={e => setNuevoEmpleado({...nuevoEmpleado, nombre: e.target.value})} required autoFocus />
              </div>
              <div className="form-group">
                <label>Correo Electrónico (Para iniciar sesión)</label>
                <input type="email" value={nuevoEmpleado.email} onChange={e => setNuevoEmpleado({...nuevoEmpleado, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Contraseña Temporal</label>
                <input type="text" value={nuevoEmpleado.password} onChange={e => setNuevoEmpleado({...nuevoEmpleado, password: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Rol en el Sistema</label>
                <select value={nuevoEmpleado.rol} onChange={e => setNuevoEmpleado({...nuevoEmpleado, rol: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-base)', color: 'white', border: '1px solid var(--border)' }}>
                  <option value="cajero">Cajero (Solo Caja y Cierre)</option>
                  <option value="admin">Administrador (Acceso Total)</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '15px' }}>Guardar Empleado</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Personal;