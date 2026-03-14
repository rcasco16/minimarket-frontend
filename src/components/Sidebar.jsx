import React from 'react';

function Sidebar({ usuarioActivo, vistaActual, setVistaActual, cerrarSesion, menuColapsado, setMenuColapsado }) {
  
  // Verificamos si es administrador (Aseguramos que no importe si está en mayúscula o minúscula)
  const esAdmin = usuarioActivo?.rol?.toLowerCase() === 'admin' || usuarioActivo?.rol?.toLowerCase() === 'administrador';

  return (
    <aside className={`sidebar ${menuColapsado ? 'colapsado' : ''}`}>
      
      <button className="btn-toggle" onClick={() => setMenuColapsado(!menuColapsado)}>
        {menuColapsado ? '▶' : '◀'}
      </button>

      <div className="sidebar-header">
        <h2>{menuColapsado ? 'RC' : 'RC Creación de Software'}</h2>
        {!menuColapsado && <p>Minimarket SaaS</p>}
      </div>
      
      <nav className="sidebar-nav">
        {/* Estos dos botones los ven TODOS (Admin y Cajero) */}
        <button className={`nav-item ${vistaActual === 'caja' ? 'active' : ''}`} onClick={() => setVistaActual('caja')} title="Punto de Venta">
          🛒 <span className="texto-menu">Punto de Venta</span>
        </button>
        
        <button className={`nav-item ${vistaActual === 'cierre' ? 'active' : ''}`} onClick={() => setVistaActual('cierre')} title="Cierre de Caja">
          💵 <span className="texto-menu">Cierre de Caja</span>
        </button>

        {/* 👇 ESTOS BOTONES SOLO APARECEN SI EL ROL ES 'ADMIN' 👇 */}
        {esAdmin && (
          <>
            <button className={`nav-item ${vistaActual === 'inventario' ? 'active' : ''}`} onClick={() => setVistaActual('inventario')} title="Inventario">
              📦 <span className="texto-menu">Inventario</span>
            </button>

            <button className={`nav-item ${vistaActual === 'reportes' ? 'active' : ''}`} onClick={() => setVistaActual('reportes')} title="Reportes">
              📊 <span className="texto-menu">Reportes</span>
            </button>

            <button className={`nav-item ${vistaActual === 'personal' ? 'active' : ''}`} onClick={() => setVistaActual('personal')} title="Personal">
              👥 <span className="texto-menu">Personal</span>
            </button>

          </>
        )}
      </nav>

      <div className="desktop-footer">
        {menuColapsado ? (
           <p style={{ textAlign: 'center', marginBottom: '10px' }}>👤</p>
        ) : (
           <div>
             <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>👤 {usuarioActivo.nombre}</p>
             <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase' }}>Rol: {usuarioActivo.rol}</p>
           </div>
        )}
        <button className="btn-danger" style={{ width: '100%' }} onClick={cerrarSesion} title="Salir">
          {menuColapsado ? '🚪' : 'Salir'}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;