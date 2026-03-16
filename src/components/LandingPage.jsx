import React from 'react';

function LandingPage({ onIrAlLogin, onProbarDemo }) {
  
  const irAWhatsApp = () => {
    const mensaje = "Hola Rodrigo, me interesa una demo del sistema para mi negocio.";
    window.open(`https://wa.me/595986164945?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', color: 'white', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      
      {/* --- BARRA DE NAVEGACIÓN --- */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 50px', 
        backgroundColor: '#1e293b' 
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#3b82f6' }}>RC Creación de Software</div>
        <button 
          onClick={onIrAlLogin} 
          style={{ 
            backgroundColor: 'transparent', 
            color: 'white', 
            border: '1px solid #3b82f6', 
            padding: '8px 20px', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          Acceso Clientes
        </button>
      </nav>

      {/* --- SECCIÓN HERO (PRINCIPAL) --- */}
      <header style={{ 
        padding: '100px 20px', 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
      }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', lineHeight: '1.2' }}>
          Toma el control total de tu <span style={{ color: '#3b82f6' }}>Minimarket</span>
        </h1>
        <p style={{ fontSize: '1.3rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 40px' }}>
          Olvida el cuaderno. Gestiona stock, ventas y ganancias desde cualquier lugar con el sistema más intuitivo de Paraguay.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <button 
            onClick={onProbarDemo} 
            style={{ 
              padding: '18px 40px', 
              fontSize: '1.1rem', 
              backgroundColor: '#f59e0b', 
              color: 'black', 
              border: 'none', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
            }}
          >
            🚀 PROBAR DEMO GRATIS
          </button>
          
          <button 
            onClick={irAWhatsApp} 
            style={{ 
              padding: '18px 40px', 
              fontSize: '1.1rem', 
              backgroundColor: '#22c55e', 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              fontWeight: 'bold' 
            }}
          >
            Hablar por WhatsApp
          </button>
        </div>
      </header>

      {/* --- CARACTERÍSTICAS --- */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2.5rem' }}>¿Por qué elegir nuestro sistema?</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '30px' 
        }}>
          <div style={{ padding: '40px', background: '#1e293b', borderRadius: '20px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📦</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Control de Stock Inteligente</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>Alertas automáticas cuando tus productos estrella se están terminando. Nunca más pierdas una venta por falta de mercadería.</p>
          </div>
          
          <div style={{ padding: '40px', background: '#1e293b', borderRadius: '20px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>💰</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Ganancia Real en Gs.</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>Visualiza tu capital invertido y tu ganancia neta al instante. Reportes diarios, semanales y mensuales detallados.</p>
          </div>
          
          <div style={{ padding: '40px', background: '#1e293b', borderRadius: '20px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📱</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Tu Negocio en tu Bolsillo</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>Acceso remoto total. Mira cuánto se está vendiendo en tu local en tiempo real desde tu casa o donde estés.</p>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN DE PRECIOS --- */}
      <section style={{ padding: '100px 20px', backgroundColor: '#0f172a', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Planes Simples y Transparentes</h2>
        <p style={{ color: '#94a3b8', marginBottom: '50px' }}>Sin costos ocultos ni contratos complicados.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Plan Básico */}
          <div style={{ padding: '40px', background: '#1e293b', borderRadius: '20px', width: '300px', border: '1px solid #334155' }}>
            <h4 style={{ color: '#94a3b8', textTransform: 'uppercase' }}>Plan Básico</h4>
            <h2 style={{ fontSize: '2.5rem', margin: '20px 0' }}>Gs. 100.000 <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/mes</span></h2>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', margin: '30px 0', lineHeight: '2' }}>
              <li>✅ 1 Usuario Administrador</li>
              <li>✅ Inventario Ilimitado</li>
              <li>✅ Punto de Venta Rápido</li>
              <li>✅ Reportes Básicos</li>
            </ul>
            <button onClick={irAWhatsApp} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #3b82f6', backgroundColor: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Solicitar Plan</button>
          </div>
          
          {/* Plan Emprendedor */}
          <div style={{ 
            padding: '50px 40px', 
            background: '#3b82f6', 
            color: 'white', 
            borderRadius: '25px', 
            width: '320px', 
            boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#f59e0b', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: 'black' }}>RECOMENDADO</div>
            <h4 style={{ textTransform: 'uppercase', opacity: '0.9' }}>Plan Emprendedor</h4>
            <h2 style={{ fontSize: '2.5rem', margin: '20px 0' }}>Gs. 200.000 <span style={{ fontSize: '1rem', opacity: '0.8' }}>/mes</span></h2>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', margin: '30px 0', lineHeight: '2' }}>
              <li>✅ Usuarios de Personal Ilimitados</li>
              <li>✅ Gestión de Caja y Cierres</li>
              <li>✅ Reportes Avanzados</li>
              <li>✅ Soporte vía WhatsApp</li>
            </ul>
            <button onClick={irAWhatsApp} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#0f172a', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>¡Empezar Ahora!</button>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ 
        padding: '60px 20px', 
        textAlign: 'center', 
        borderTop: '1px solid #1e293b',
        color: '#64748b' 
      }}>
        <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>RC Creación de Software</div>
        <p>Coronel Oviedo, Caaguazú - Paraguay</p>
        <div style={{ marginTop: '20px' }}>
            Desarrollado con ❤️ para los comerciantes paraguayos.
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;