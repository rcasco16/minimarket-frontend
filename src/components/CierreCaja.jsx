import React, { useState, useEffect } from 'react';

function CierreCaja({ usuarioActivo }) {
  const [montoInicial, setMontoInicial] = useState('');
  const [resumen, setResumen] = useState({
    efectivo: 0, tarjeta: 0, transferencia: 0, ingresos_totales: 0, costo_total: 0, ganancia_neta: 0
  });

  const cargarResumen = async () => {
    try {
      const token = localStorage.getItem('tokenMinimarket');
      // 👇 URL ACTUALIZADA (1/2) 👇
      const respuesta = await fetch(`https://api-minimarket-rc.onrender.com/api/ventas/resumen-diario/${usuarioActivo.empresa_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setResumen(datos);
      }
    } catch (error) { console.error("Error al cargar el resumen:", error); }
  };

  useEffect(() => { cargarResumen(); }, [usuarioActivo.empresa_id]);

  // 👇 NUEVA FUNCIÓN PARA CERRAR EL TURNO 👇
  const procesarCierreDeCaja = async () => {
    // Pedimos confirmación para evitar clics accidentales
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas CERRAR LA CAJA?\n\nEsto dejará los contadores en cero para que inicie un nuevo turno."
    );

    if (!confirmar) return;

    try {
      const token = localStorage.getItem('tokenMinimarket');
      // 👇 URL ACTUALIZADA (2/2) 👇
      const respuesta = await fetch('https://api-minimarket-rc.onrender.com/api/ventas/cerrar-turno', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (respuesta.ok) {
        alert("¡Caja cerrada exitosamente! Buen trabajo.");
        setMontoInicial(''); // Limpiamos la caja inicial
        cargarResumen();     // Recargamos (ahora vendrá en 0)
      } else {
        alert("Hubo un error al cerrar la caja.");
      }
    } catch (error) { console.error("Error:", error); }
  };

  const totalBancos = Number(resumen.tarjeta) + Number(resumen.transferencia);
  const totalVentasDia = Number(resumen.efectivo) + totalBancos;
  const dineroFisicoEsperado = Number(montoInicial) + Number(resumen.efectivo);
  const fechaHoy = new Date().toLocaleDateString('es-PY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Si no hay ventas, mostramos un mensaje para que no se vea todo en 0 innecesariamente
  const cajaVacia = totalVentasDia === 0;

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px', paddingBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>💵 Cierre de Caja (Arqueo)</h2>
        <p style={{ color: 'var(--accent)', textTransform: 'capitalize', fontWeight: 'bold' }}>Turno Actual</p>
      </div>

      <div className="panel" style={{ padding: '20px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #4CAF50' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Fondo de Caja Inicial</h3>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '14px' }}>¿Con cuánto dinero físico en billetes/monedas empezó el turno?</p>
        </div>
        <div>
          <input type="number" value={montoInicial} onChange={(e) => setMontoInicial(e.target.value)} style={{ fontSize: '24px', padding: '15px', width: '200px', textAlign: 'right', borderRadius: '8px', border: '2px solid var(--accent)' }} placeholder="Ej: 150000" />
        </div>
      </div>

      <h3 style={{ marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Resumen de Operaciones Activas</h3>
      
      {cajaVacia ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-panel)', borderRadius: '8px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
          <h3 style={{ color: 'var(--text-dim)' }}>La caja está en cero.</h3>
          <p style={{ color: 'var(--text-dim)' }}>Registra nuevas ventas en el Punto de Venta para comenzar el turno.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="panel" style={{ padding: '20px', textAlign: 'center' }}><p style={{ margin: '0 0 10px 0', color: 'var(--text-dim)' }}>Ventas en Efectivo 💵</p><h2 style={{ margin: 0, color: 'white' }}>Gs. {Number(resumen.efectivo).toLocaleString('es-PY')}</h2></div>
            <div className="panel" style={{ padding: '20px', textAlign: 'center' }}><p style={{ margin: '0 0 10px 0', color: 'var(--text-dim)' }}>Tarjetas (POS) 💳</p><h2 style={{ margin: 0, color: 'white' }}>Gs. {Number(resumen.tarjeta).toLocaleString('es-PY')}</h2></div>
            <div className="panel" style={{ padding: '20px', textAlign: 'center' }}><p style={{ margin: '0 0 10px 0', color: 'var(--text-dim)' }}>Transferencias / QR 📱</p><h2 style={{ margin: 0, color: 'white' }}>Gs. {Number(resumen.transferencia).toLocaleString('es-PY')}</h2></div>
          </div>

          <h3 style={{ marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Resultados del Cierre</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            
            <div className="panel" style={{ padding: '25px', backgroundColor: '#1e293b', border: '1px solid #3b82f6' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#60a5fa', fontSize: '18px' }}>💰 Dinero Físico en Caja</h4>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-dim)' }}>Fondo Inicial:</span> <span>Gs. {Number(montoInicial).toLocaleString('es-PY')}</span></p>
              <p style={{ margin: '0 0 15px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #475569', paddingBottom: '10px' }}><span style={{ color: 'var(--text-dim)' }}>+ Ventas Efectivo:</span> <span>Gs. {Number(resumen.efectivo).toLocaleString('es-PY')}</span></p>
              <h2 style={{ margin: 0, color: 'white', textAlign: 'right', fontSize: '32px' }}>Gs. {dineroFisicoEsperado.toLocaleString('es-PY')}</h2>
              <p style={{ margin: '10px 0 0 0', color: '#94a3b8', fontSize: '12px', textAlign: 'right' }}>Debe haber en el cajón</p>
            </div>

            <div className="panel" style={{ padding: '25px', backgroundColor: '#312e81', border: '1px solid #6366f1' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#818cf8', fontSize: '18px' }}>🏦 Dinero en Bancos</h4>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-dim)' }}>Tarjetas POS:</span> <span>Gs. {Number(resumen.tarjeta).toLocaleString('es-PY')}</span></p>
              <p style={{ margin: '0 0 15px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #4f46e5', paddingBottom: '10px' }}><span style={{ color: 'var(--text-dim)' }}>+ Transferencias:</span> <span>Gs. {Number(resumen.transferencia).toLocaleString('es-PY')}</span></p>
              <h2 style={{ margin: 0, color: 'white', textAlign: 'right', fontSize: '32px' }}>Gs. {totalBancos.toLocaleString('es-PY')}</h2>
              <p style={{ margin: '10px 0 0 0', color: '#a5b4fc', fontSize: '12px', textAlign: 'right' }}>Ingresos digitales de hoy</p>
            </div>

            <div className="panel" style={{ padding: '25px', backgroundColor: '#14532d', border: '1px solid var(--accent)' }}>
              <h4 style={{ margin: '0 0 15px 0', color: 'var(--accent)', fontSize: '18px' }}>📈 Rendimiento del Turno</h4>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#bbf7d0' }}>Total Vendido:</span> <span style={{ fontWeight: 'bold', color: 'white' }}>Gs. {totalVentasDia.toLocaleString('es-PY')}</span></p>
              <p style={{ margin: '0 0 15px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #22c55e', paddingBottom: '10px' }}><span style={{ color: '#bbf7d0' }}>- Costo Productos:</span> <span style={{ color: '#fca5a5' }}>Gs. {Number(resumen.costo_total).toLocaleString('es-PY')}</span></p>
              <h2 style={{ margin: 0, color: 'var(--accent)', textAlign: 'right', fontSize: '32px' }}>Gs. {Number(resumen.ganancia_neta).toLocaleString('es-PY')}</h2>
              <p style={{ margin: '10px 0 0 0', color: '#bbf7d0', fontSize: '12px', textAlign: 'right' }}>Ganancia Neta (Utilidad)</p>
            </div>
          </div>

          {/* 👇 BOTÓN PARA REALIZAR EL CIERRE 👇 */}
          <div style={{ borderTop: '2px solid var(--border)', paddingTop: '20px', textAlign: 'right' }}>
            <button 
              onClick={procesarCierreDeCaja}
              style={{ backgroundColor: '#dc2626', color: 'white', padding: '15px 30px', fontSize: '18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🔒 CERRAR CAJA Y FINALIZAR TURNO
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CierreCaja;