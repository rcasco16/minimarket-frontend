import React, { useState, useEffect } from 'react';

function Reportes({ usuarioActivo }) {
  const [datos, setDatos] = useState({
    kpis: { totalVendido: 0, costoTotal: 0, gananciaNeta: 0, cantidadTickets: 0 },
    tickets: [],
    productosEstrella: []
  });

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const cargarReportes = async () => {
    try {
      const token = localStorage.getItem('tokenMinimarket');
      
      // 👇 ACÁ ESTÁ EL CAMBIO A PRODUCCIÓN 👇
      let url = `https://api-minimarket-rc.onrender.com/api/reportes/${usuarioActivo.empresa_id}`;
      
      if (fechaInicio && fechaFin) {
        url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      }

      const respuesta = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (respuesta.ok) {
        const data = await respuesta.json();
        setDatos(data);
      }
    } catch (error) {
      console.error("Error al cargar reportes:", error);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, [usuarioActivo.empresa_id]);

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px', paddingBottom: '30px' }}>
      
      {/* CABECERA Y FILTROS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' }}>
        <h2>📊 Panel de Reportes</h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', backgroundColor: 'var(--bg-panel)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Desde:</label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#222', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px' }}>Hasta:</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#222', color: 'white' }} />
          </div>
          <button className="btn-primary" onClick={cargarReportes} style={{ padding: '10px 20px', height: '42px' }}>
            Filtrar
          </button>
          <button onClick={() => { setFechaInicio(''); setFechaFin(''); setTimeout(cargarReportes, 100); }} style={{ padding: '10px 20px', height: '42px', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>
            Limpiar
          </button>
        </div>
      </div>

      {/* 1. TARJETAS DE INDICADORES (KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="panel" style={{ padding: '25px', borderLeft: '4px solid #3b82f6' }}>
          <p style={{ margin: '0 0 10px 0', color: 'var(--text-dim)', fontSize: '14px' }}>Ingresos Totales (Ventas)</p>
          <h2 style={{ margin: 0, color: 'white', fontSize: '28px' }}>Gs. {Number(datos.kpis.totalVendido).toLocaleString('es-PY')}</h2>
        </div>
        
        <div className="panel" style={{ padding: '25px', borderLeft: '4px solid #10b981' }}>
          <p style={{ margin: '0 0 10px 0', color: 'var(--text-dim)', fontSize: '14px' }}>Ganancia Neta (Utilidad)</p>
          <h2 style={{ margin: 0, color: '#10b981', fontSize: '28px' }}>Gs. {Number(datos.kpis.gananciaNeta).toLocaleString('es-PY')}</h2>
        </div>

        <div className="panel" style={{ padding: '25px', borderLeft: '4px solid #8b5cf6' }}>
          <p style={{ margin: '0 0 10px 0', color: 'var(--text-dim)', fontSize: '14px' }}>Tickets Emitidos</p>
          <h2 style={{ margin: 0, color: 'white', fontSize: '28px' }}>{datos.kpis.cantidadTickets} <span style={{fontSize: '16px', color: 'var(--text-dim)', fontWeight: 'normal'}}>ventas</span></h2>
        </div>
      </div>

      {/* 👇 AQUÍ APLICAMOS EL TRUCO alignItems: 'stretch' PARA IGUALAR ALTURAS 👇 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'stretch' }}>
        
        {/* 2. HISTORIAL DE TICKETS (Lado Izquierdo) */}
        {/* 👇 Le agregamos flex column para que la tabla use todo el espacio sobrante 👇 */}
        <div className="panel" style={{ flex: '2', minWidth: '350px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '20px' }}>🧾 Historial de Operaciones</h3>
          <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Método</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {datos.tickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td style={{ color: 'var(--text-dim)' }}>{new Date(ticket.fecha_hora).toLocaleString('es-PY')}</td>
                    <td>{ticket.metodo_pago}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                        backgroundColor: ticket.estado_caja === 'Abierta' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                        color: ticket.estado_caja === 'Abierta' ? '#60a5fa' : '#94a3b8'
                      }}>
                        {ticket.estado_caja}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent)' }}>Gs. {Number(ticket.total).toLocaleString('es-PY')}</td>
                  </tr>
                ))}
                {datos.tickets.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No hay ventas registradas en este periodo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. PRODUCTOS ESTRELLA (Lado Derecho) */}
        <div className="panel" style={{ flex: '1', minWidth: '300px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '20px' }}>⭐ Top 5 Más Vendidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {datos.productosEstrella.map((prod, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent)' }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: 'white' }}>{prod.nombre}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>{prod.cantidad_vendida} unidades vendidas</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981' }}>Gs. {Number(prod.total_generado).toLocaleString('es-PY')}</p>
                </div>
              </div>
            ))}
            {datos.productosEstrella.length === 0 && (
               <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '20px' }}>No hay datos suficientes.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Reportes;