import React from 'react';

function LandingPage() {
  const irAWhatsApp = () => {
    const mensaje = "Hola Rodrigo, me interesa una demo del sistema para mi negocio.";
    window.open(`https://wa.me/595986164945?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', color: 'white', backgroundColor: '#0f172a' }}>
      {/* SECCIÓN HERO */}
      <header style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>RC Creación de Software</h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 30px' }}>
          El sistema de gestión más sencillo y potente para Minimarkets y Despensas en Paraguay.
        </p>
        <button onClick={irAWhatsApp} style={{ padding: '15px 30px', fontSize: '1.1rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
          ¡Quiero mi Demo Gratis!
        </button>
      </header>

      {/* CARACTERÍSTICAS */}
      <section style={{ padding: '60px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '30px', background: '#1e293b', borderRadius: '15px', textAlign: 'center' }}>
          <h3>📦 Control de Stock</h3>
          <p style={{ color: '#94a3b8' }}>Sepa qué productos se terminan y reciba alertas automáticas.</p>
        </div>
        <div style={{ padding: '30px', background: '#1e293b', borderRadius: '15px', textAlign: 'center' }}>
          <h3>💰 Ganancia Real</h3>
          <p style={{ color: '#94a3b8' }}>Visualice su capital invertido y su ganancia neta en Gs. al instante.</p>
        </div>
        <div style={{ padding: '30px', background: '#1e293b', borderRadius: '15px', textAlign: 'center' }}>
          <h3>📱 Acceso Remoto</h3>
          <p style={{ color: '#94a3b8' }}>Controle sus ventas desde su celular, esté donde esté.</p>
        </div>
      </section>

      {/* PRECIOS */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '40px' }}>Planes diseñados para usted</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ padding: '40px', background: 'white', color: '#0f172a', borderRadius: '20px', width: '280px' }}>
            <h4>Plan Básico</h4>
            <h2 style={{ fontSize: '2rem' }}>Gs. 100.000</h2>
            <p>/ mes</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', margin: '20px 0' }}>
              <li>✅ 1 Usuario Admin</li>
              <li>✅ Inventario Ilimitado</li>
              <li>✅ Reportes de Venta</li>
            </ul>
            <button onClick={irAWhatsApp} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #0f172a', cursor: 'pointer' }}>Elegir Básico</button>
          </div>
          
          <div style={{ padding: '40px', background: '#3b82f6', color: 'white', borderRadius: '20px', width: '280px', transform: 'scale(1.05)', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)' }}>
            <h4>Plan Emprendedor</h4>
            <h2 style={{ fontSize: '2rem' }}>Gs. 200.000</h2>
            <p>/ mes</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', margin: '20px 0' }}>
              <li>✅ Usuarios Ilimitados</li>
              <li>✅ Gestión de Personal</li>
              <li>✅ Soporte Prioritario</li>
            </ul>
            <button onClick={irAWhatsApp} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#0f172a', color: 'white', cursor: 'pointer' }}>El más vendido</button>
          </div>
        </div>
      </section>

      <footer style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        © 2026 RC Creación de Software - Coronel Oviedo, Paraguay.
      </footer>
    </div>
  );
}

export default LandingPage;