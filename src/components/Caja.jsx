import React, { useState, useRef, useEffect } from 'react';

function Caja({ productos, usuarioActivo, cargarProductos }) {
  const [carrito, setCarrito] = useState([]);
  
  // Estados del Buscador
  const [busquedaCaja, setBusquedaCaja] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Estados para preguntar la cantidad
  const [productoEnEspera, setProductoEnEspera] = useState(null);
  const [cantidadEspera, setCantidadEspera] = useState(1);
  const inputCantidadRef = useRef(null); 

  // Estados de Modales
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('');
  const [mostrarCobro, setMostrarCobro] = useState(false);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [mostrarCargaRapida, setMostrarCargaRapida] = useState(false);
  
  // NUEVO: Estado para guardar los datos de la venta y mostrar la opción de imprimir
  const [ticketImprimir, setTicketImprimir] = useState(null);

  const [productoRapido, setProductoRapido] = useState({
    codigo_barras: '', nombre: '', precio_compra: '', precio_venta: '', stock_actual: '1'
  });

  // ==========================================
  // LÓGICA DE AGREGAR PRODUCTOS
  // ==========================================
  const prepararProductoParaCarrito = (producto) => {
    setProductoEnEspera(producto);
    setCantidadEspera(1);
    setMostrarSugerencias(false);
    setMostrarCatalogo(false);
  };

  const confirmarAgregarAlCarrito = (e) => {
    if (e) e.preventDefault();
    if (!productoEnEspera) return;

    const cantNum = Number(cantidadEspera);
    if (cantNum <= 0) return;

    const itemExistente = carrito.find(item => item.id === productoEnEspera.id);
    
    if (itemExistente) {
      setCarrito(carrito.map(item => 
        item.id === productoEnEspera.id 
          ? { ...item, cantidad: item.cantidad + cantNum, subtotal: (item.cantidad + cantNum) * item.precio_venta } 
          : item 
      ));
    } else {
      setCarrito([...carrito, { 
        ...productoEnEspera, 
        cantidad: cantNum, 
        precio_unitario: productoEnEspera.precio_venta, 
        subtotal: cantNum * Number(productoEnEspera.precio_venta) 
      }]);
    }

    setProductoEnEspera(null);
    setBusquedaCaja('');
  };

  useEffect(() => {
    if (productoEnEspera && inputCantidadRef.current) {
      inputCantidadRef.current.focus();
      inputCantidadRef.current.select(); 
    }
  }, [productoEnEspera]);

  const cambiarCantidadTicket = (id, diferencia) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const nuevaCantidad = item.cantidad + diferencia;
        if (nuevaCantidad < 1) return item; 
        return { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio_unitario };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id) => { setCarrito(carrito.filter(item => item.id !== id)); };
  const totalCarrito = carrito.reduce((total, item) => total + item.subtotal, 0);

  // ==========================================
  // BUSCADOR INTELIGENTE
  // ==========================================
  const sugerencias = busquedaCaja.trim() === '' ? [] : productos.filter(p => p.nombre.toLowerCase().includes(busquedaCaja.toLowerCase()) || p.codigo_barras.includes(busquedaCaja));

  const manejarBusquedaChange = (e) => {
    setBusquedaCaja(e.target.value);
    setMostrarSugerencias(true);
  };

  const manejarEnterBusqueda = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (sugerencias.length > 0) {
        const matchExacto = sugerencias.find(p => p.codigo_barras === busquedaCaja.trim());
        prepararProductoParaCarrito(matchExacto || sugerencias[0]);
      }
    }
  };

  const vuelto = Number(montoRecibido) - totalCarrito;

  // ==========================================
  // PROCESAR EL COBRO
  // ==========================================
  const procesarVenta = async (e) => {
    if (e) e.preventDefault(); 
    if (carrito.length === 0) return;
    try {
      const token = localStorage.getItem('tokenMinimarket');
      const venta = { empresa_id: usuarioActivo.empresa_id, usuario_id: usuarioActivo.id, metodo_pago: metodoPago, total: totalCarrito, detalles: carrito.map(item => ({ producto_id: item.id, cantidad: item.cantidad, precio_unitario: item.precio_unitario, subtotal: item.subtotal })) };
      
      // 👇 URL ACTUALIZADA (1/2) 👇
      const respuesta = await fetch('https://api-minimarket-rc.onrender.com/api/ventas', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(venta) });
      
      if (respuesta.ok) {
        // En lugar de una alerta, guardamos los datos del ticket para imprimir
        setTicketImprimir({
          detalles: [...carrito],
          total: totalCarrito,
          metodoPago: metodoPago,
          recibido: montoRecibido || totalCarrito,
          vuelto: vuelto > 0 ? vuelto : 0,
          fecha: new Date().toLocaleString('es-PY')
        });

        // Limpiamos la caja para el siguiente cliente
        setCarrito([]); 
        setMostrarCobro(false); 
        setMontoRecibido(''); 
        setMetodoPago('Efectivo'); 
        cargarProductos(); 
      } else { alert("Hubo un error al procesar la venta"); }
    } catch (error) { console.error(error); }
  };

  // ==========================================
  // FUNCIÓN PARA GENERAR EL TICKET TÉRMICO
  // ==========================================
  const imprimirTicketReal = () => {
    if (!ticketImprimir) return;

    // Buscamos el nombre del local. Si el backend aún no lo envía, usamos un texto temporal.
    const nombreLocal = usuarioActivo.nombre_comercial || "Minimarket Local";

    // Abrimos una ventana oculta
    const ventana = window.open('', '_blank', 'width=400,height=600');
    
    // Escribimos el diseño de una factura de supermercado (formato 80mm)
    ventana.document.write(`
      <html>
        <head>
          <title>Ticket de Venta</title>
          <style>
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 14px; 
              margin: 0; 
              padding: 20px; 
              width: 300px; /* Ancho típico de impresora térmica */
              color: black;
            }
            h2, h3, p { margin: 5px 0; text-align: center; }
            .separador { border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
            th, td { text-align: left; padding: 4px 0; }
            .right { text-align: right; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>${nombreLocal}</h2>
          <p>Comprobante de Venta</p>
          <div class="separador"></div>
          <p style="text-align: left;">Fecha: ${ticketImprimir.fecha}</p>
          <p style="text-align: left;">Cajero: ${usuarioActivo.nombre}</p>
          <div class="separador"></div>
          <table>
            <thead>
              <tr>
                <th>Cant</th>
                <th>Descripción</th>
                <th class="right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${ticketImprimir.detalles.map(item => `
                <tr>
                  <td class="center">${item.cantidad}</td>
                  <td>${item.nombre}</td>
                  <td class="right">Gs. ${Number(item.subtotal).toLocaleString('es-PY')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="separador"></div>
          <h3 class="right">TOTAL: Gs. ${Number(ticketImprimir.total).toLocaleString('es-PY')}</h3>
          <p class="right">Pago en: ${ticketImprimir.metodoPago}</p>
          <p class="right">Recibido: Gs. ${Number(ticketImprimir.recibido).toLocaleString('es-PY')}</p>
          <p class="right">Vuelto: Gs. ${Number(ticketImprimir.vuelto).toLocaleString('es-PY')}</p>
          <div class="separador"></div>
          <p>¡Gracias por su preferencia!</p>
          <p style="font-size: 10px; color: #555; margin-top: 15px;">Sistema POS por RC Creación de Software</p>
        </body>
      </html>
    `);
    
    ventana.document.close();
    ventana.focus();
    
    setTimeout(() => {
      ventana.print();
      ventana.close(); 
    }, 250);
  };

  const guardarProductoRapido = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('tokenMinimarket');
      const productoAGuardar = { ...productoRapido, empresa_id: usuarioActivo.empresa_id, categoria_id: 1 };
      
      // 👇 URL ACTUALIZADA (2/2) 👇
      const respuesta = await fetch('https://api-minimarket-rc.onrender.com/api/productos', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(productoAGuardar) });
      
      if (respuesta.ok) {
        setMostrarCargaRapida(false); setProductoRapido({ codigo_barras: '', nombre: '', precio_compra: '', precio_venta: '', stock_actual: '1' }); cargarProductos(); alert("¡Producto rápido agregado!");
      }
    } catch (error) { console.error(error); }
  };

  const catalogoFiltrado = productos.filter(prod => prod.nombre.toLowerCase().includes(busquedaCatalogo.toLowerCase()) || prod.codigo_barras.includes(busquedaCatalogo));

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', height: '100%' }} onClick={() => setMostrarSugerencias(false)}>
      
      {/* PANEL IZQUIERDO: Buscador */}
      <div style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="panel" style={{ padding: '30px', borderTop: '4px solid var(--accent)' }}>
          <h2 style={{ marginBottom: '20px', color: 'white' }}>🔍 Buscar y Agregar</h2>
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <input type="text" placeholder="Escribe el nombre o escanea el código y presiona Enter..." value={busquedaCaja} onChange={manejarBusquedaChange} onKeyDown={manejarEnterBusqueda} onFocus={() => { if(busquedaCaja) setMostrarSugerencias(true); }} autoFocus style={{ width: '100%', padding: '15px', fontSize: '18px', borderRadius: '8px' }} />
            {mostrarSugerencias && sugerencias.length > 0 && (
              <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#2a2a2a', border: '1px solid var(--border)', borderRadius: '8px', zIndex: 10, listStyle: 'none', padding: 0, margin: '5px 0 0 0', maxHeight: '250px', overflowY: 'auto', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
                {sugerencias.map(prod => (
                  <li key={prod.id} onClick={() => prepararProductoParaCarrito(prod)} style={{ padding: '15px', cursor: 'pointer', borderBottom: '1px solid #3a3a3a', display: 'flex', justifyContent: 'space-between', color: 'white' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <span>{prod.nombre}</span><span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Gs. {Number(prod.precio_venta).toLocaleString('es-PY')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => setMostrarCatalogo(true)} style={{ flex: 1, padding: '20px', fontSize: '16px', backgroundColor: '#333', color: 'white', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }}>📋 Catálogo Visual</button>
          <button onClick={() => setMostrarCargaRapida(true)} style={{ flex: 1, padding: '20px', fontSize: '16px', backgroundColor: '#333', color: 'var(--accent)', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 'bold' }}>⚡ Carga Rápida</button>
        </div>
      </div>

      {/* PANEL DERECHO: El Ticket */}
      <div style={{ flex: '1', minWidth: '350px', backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
          🧾 Ticket de Venta <span style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: 'normal' }}>{carrito.length} items</span>
        </h3>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
          {carrito.length === 0 ? ( <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '50px' }}>El ticket está vacío</p> ) : (
            carrito.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px dashed #333', paddingBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 5px 0', color: 'white', fontWeight: 'bold' }}>{item.nombre}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => cambiarCantidadTicket(item.id, -1)} style={{ padding: '2px 8px', background: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                    <span style={{ color: 'var(--text-dim)', fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>{item.cantidad}</span>
                    <button onClick={() => cambiarCantidadTicket(item.id, 1)} style={{ padding: '2px 8px', background: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                    <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}> x Gs. {Number(item.precio_unitario).toLocaleString('es-PY')}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                  <span style={{ fontWeight: 'bold', color: 'white', fontSize: '16px' }}>Gs. {Number(item.subtotal).toLocaleString('es-PY')}</span>
                  <button onClick={() => eliminarDelCarrito(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Quitar</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ borderTop: '2px solid var(--border)', paddingTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--accent)' }}><span>TOTAL:</span><span>Gs. {totalCarrito.toLocaleString('es-PY')}</span></div>
          <button className="btn-primary" style={{ width: '100%', padding: '20px', fontSize: '20px', borderRadius: '8px' }} onClick={() => { setMetodoPago('Efectivo'); setMontoRecibido(totalCarrito); setMostrarCobro(true); }} disabled={carrito.length === 0}>💰 Proceder al Cobro</button>
        </div>
      </div>

      {/* ==========================================
          MODALES
      ========================================== */}

      {/* NUEVO: Modal de Éxito e Impresión de Ticket */}
      {ticketImprimir && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--accent)', marginBottom: '10px' }}>¡Venta Exitosa! 🎉</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>La venta se ha guardado en la base de datos.</p>
            
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left', border: '1px dashed var(--border)' }}>
              <h4 style={{ margin: '0 0 15px 0', textAlign: 'center', color: 'white' }}>Resumen Rápido</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Total Venta:</span> <strong style={{color: 'white'}}>Gs. {ticketImprimir.total.toLocaleString('es-PY')}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Método:</span> <span>{ticketImprimir.metodoPago}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Recibido:</span> <span>Gs. {ticketImprimir.recibido.toLocaleString('es-PY')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #444', paddingTop: '8px' }}><span>Vuelto entregado:</span> <strong style={{color: 'var(--accent)'}}>Gs. {ticketImprimir.vuelto.toLocaleString('es-PY')}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button className="btn-primary" onClick={imprimirTicketReal} style={{ padding: '15px', fontSize: '18px' }}>
                🖨️ Imprimir Ticket (PDF/Térmica)
              </button>
              <button onClick={() => setTicketImprimir(null)} style={{ padding: '15px', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>
                Siguiente Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resto de Modales (Cantidad, Catálogo, Cobro, Carga Rápida) */}
      {productoEnEspera && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '350px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px' }}>Indicar Cantidad</h3><p style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: '15px', fontSize: '18px' }}>{productoEnEspera.nombre}</p>
            <form onSubmit={confirmarAgregarAlCarrito}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}><input ref={inputCantidadRef} type="number" min="1" value={cantidadEspera} onChange={(e) => setCantidadEspera(e.target.value)} style={{ width: '100px', padding: '15px', fontSize: '24px', textAlign: 'center', borderRadius: '8px' }} /></div>
              <div style={{ display: 'flex', gap: '10px' }}><button type="button" onClick={() => setProductoEnEspera(null)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button><button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>Aceptar</button></div>
            </form>
          </div>
        </div>
      )}

      {mostrarCatalogo && (
        <div className="modal-overlay" onClick={() => setMostrarCatalogo(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}><div className="modal-header"><h3>📋 Catálogo</h3><button className="btn-close" onClick={() => setMostrarCatalogo(false)}>×</button></div><input type="text" placeholder="🔍 Buscar en catálogo..." value={busquedaCatalogo} onChange={(e) => setBusquedaCatalogo(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px' }} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px', overflowY: 'auto', paddingRight: '10px' }}>{catalogoFiltrado.map(prod => (<div key={prod.id} onClick={() => prepararProductoParaCarrito(prod)} style={{ backgroundColor: 'var(--bg-base)', padding: '15px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border)' }}><h4 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '14px' }}>{prod.nombre}</h4><p style={{ margin: 0, color: 'var(--accent)', fontWeight: 'bold' }}>Gs. {Number(prod.precio_venta).toLocaleString('es-PY')}</p></div>))}</div></div>
        </div>
      )}

      {mostrarCobro && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header"><h3 style={{ margin: '0 auto' }}>Confirmar Pago</h3><button className="btn-close" onClick={() => setMostrarCobro(false)}>×</button></div>
            <h2 style={{ fontSize: '36px', color: 'var(--accent)', margin: '20px 0' }}>Gs. {totalCarrito.toLocaleString('es-PY')}</h2>
            <form onSubmit={procesarVenta}>
              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <label style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>Método de Pago:</label>
                <select value={metodoPago} onChange={(e) => { setMetodoPago(e.target.value); if(e.target.value === 'Efectivo') { setMontoRecibido(totalCarrito); } else { setMontoRecibido(''); } }} style={{ width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-base)', color: 'white', border: '1px solid var(--border)' }}><option value="Efectivo">💵 Efectivo</option><option value="Tarjeta">💳 Tarjeta (POS)</option><option value="Transferencia">📱 Transferencia</option></select>
              </div>
              {metodoPago === 'Efectivo' && (
                <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                  <label style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>Recibido (Gs.):</label>
                  <input type="number" value={montoRecibido} onChange={(e) => setMontoRecibido(e.target.value)} style={{ fontSize: '20px', padding: '15px', width: '100%' }} autoFocus onFocus={(e) => e.target.select()} />
                  {montoRecibido && vuelto > 0 && ( <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid var(--accent)', borderRadius: '8px' }}><p style={{ margin: 0 }}>Vuelto a entregar:</p><h3 style={{ margin: '5px 0 0 0', color: 'var(--accent)', fontSize: '24px' }}>Gs. {vuelto.toLocaleString('es-PY')}</h3></div> )}
                  {montoRecibido !== '' && vuelto === 0 && ( <p style={{ color: 'var(--accent)', marginTop: '10px', fontWeight: 'bold' }}>Pago exacto. Sin vuelto.</p> )}
                </div>
              )}
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: '18px', marginTop: '10px' }} disabled={metodoPago === 'Efectivo' && (montoRecibido === '' || vuelto < 0)}>Confirmar Venta</button>
            </form>
          </div>
        </div>
      )}

      {mostrarCargaRapida && (
        <div className="modal-overlay">
          <div className="modal-content"><div className="modal-header"><h3>⚡ Carga Rápida</h3><button className="btn-close" onClick={() => setMostrarCargaRapida(false)}>×</button></div><form onSubmit={guardarProductoRapido}><div className="form-grid"><div className="form-group full-width"><label>Nombre</label><input type="text" value={productoRapido.nombre} onChange={(e) => setProductoRapido({...productoRapido, nombre: e.target.value})} required autoFocus/></div><div className="form-group"><label>Cód. Barras</label><input type="text" value={productoRapido.codigo_barras} onChange={(e) => setProductoRapido({...productoRapido, codigo_barras: e.target.value})} required /></div><div className="form-group"><label>Stock</label><input type="number" value={productoRapido.stock_actual} onChange={(e) => setProductoRapido({...productoRapido, stock_actual: e.target.value})} required /></div><div className="form-group"><label>Costo (Gs.)</label><input type="number" value={productoRapido.precio_compra} onChange={(e) => setProductoRapido({...productoRapido, precio_compra: e.target.value})} required /></div><div className="form-group"><label>Venta (Gs.)</label><input type="number" value={productoRapido.precio_venta} onChange={(e) => setProductoRapido({...productoRapido, precio_venta: e.target.value})} required /></div></div><button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '15px' }}>Guardar</button></form></div>
        </div>
      )}

    </div>
  );
}

export default Caja;