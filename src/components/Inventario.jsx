import React, { useState, useEffect } from 'react';
// 👇 IMPORTACIÓN ACTUALIZADA: Agregamos Html5QrcodeSupportedFormats
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

function Inventario({ productos, usuarioActivo, cargarProductos }) {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  // Estado para controlar si se muestra la cámara
  const [mostrarScanner, setMostrarScanner] = useState(false);

  const [categorias, setCategorias] = useState([]);

  const [nuevoProducto, setNuevoProducto] = useState({
    id: '', codigo_barras: '', nombre: '', precio_compra: '', precio_venta: '',
    stock_actual: '', stock_minimo: '', porcentaje_ganancia: '', categoria_id: '',
    proveedor: '', unidad_medida: 'unidad'
  });

  const cargarCategorias = async () => {
    try {
      const token = localStorage.getItem('tokenMinimarket');
      const res = await fetch(`https://api-minimarket-rc.onrender.com/api/categorias/empresa/${usuarioActivo.empresa_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
        if (data.length > 0 && !nuevoProducto.categoria_id) {
          setNuevoProducto(prev => ({ ...prev, categoria_id: data[0].id }));
        }
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // 👇 ACTUALIZADO: Efecto optimizado para leer SOLO códigos de barras de productos
  useEffect(() => {
    let html5QrCode;

    if (mostrarScanner) {
      setTimeout(() => {
        html5QrCode = new Html5Qrcode("reader");
        
        html5QrCode.start(
          { facingMode: "environment" }, // Fuerza la cámara trasera
          {
            fps: 20, // 🚀 Aumentamos a 20 FPS para que sea más rápido
            qrbox: { width: 250, height: 120 }, // Rectángulo ideal para códigos de barras
            aspectRatio: 1.0,
            // 🚀 MAGIA: Le decimos que SOLO busque códigos de supermercado (ignora QRs)
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODE_128
            ]
          },
          (decodedText) => {
            // Éxito: Lo leyó
            setNuevoProducto(prev => ({ ...prev, codigo_barras: decodedText }));
            setMostrarScanner(false);
          },
          (errorMessage) => {
            // Ignoramos los errores de lectura continua para no saturar la consola
          }
        ).catch((err) => {
          console.error("Error al iniciar la cámara:", err);
          alert("No se pudo acceder a la cámara. Verifica los permisos de tu navegador.");
          setMostrarScanner(false);
        });
      }, 300); // Le damos 300ms para asegurar que el div "reader" ya existe en el DOM
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
      }
    };
  }, [mostrarScanner]);

  const crearNuevaCategoriaDirecto = async () => {
    const nombreNuevaCat = window.prompt("Ingresa el nombre de la nueva categoría:");
    if (nombreNuevaCat && nombreNuevaCat.trim() !== '') {
      try {
        const token = localStorage.getItem('tokenMinimarket');
        const res = await fetch('https://api-minimarket-rc.onrender.com/api/categorias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            nombre: nombreNuevaCat.trim(),
            empresa_id: usuarioActivo.empresa_id
          })
        });

        if (res.ok) {
          const data = await res.json();
          await cargarCategorias();
          setNuevoProducto(prev => ({ ...prev, categoria_id: data.id }));
          alert(`Categoría "${nombreNuevaCat}" creada.`);
        } else {
          alert("Error al crear categoría.");
        }
      } catch (error) {
        alert("Error de conexión.");
      }
    }
  };

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;

    if (name === 'categoria_id' && value === 'nueva') {
      setNuevoProducto(prev => ({ ...prev, categoria_id: categorias[0]?.id || '' }));
      setTimeout(async () => {
        const nombreNuevaCat = window.prompt("Ingresa el nombre de la nueva categoría:");
        if (nombreNuevaCat && nombreNuevaCat.trim() !== '') {
          try {
            const token = localStorage.getItem('tokenMinimarket');
            if (!usuarioActivo?.empresa_id) {
              alert("Error: No se detectó el ID de la empresa. Reintenta loguearte.");
              return;
            }
            const res = await fetch('https://api-minimarket-rc.onrender.com/api/categorias', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                nombre: nombreNuevaCat.trim(),
                empresa_id: usuarioActivo.empresa_id
              })
            });

            const data = await res.json();
            if (res.ok) {
              await cargarCategorias();
              setNuevoProducto(prev => ({ ...prev, categoria_id: data.id }));
              alert(`Categoría "${nombreNuevaCat}" creada con éxito.`);
            } else {
              alert("Error del servidor: " + (data.mensaje || "No se pudo guardar"));
            }
          } catch (error) {
            console.error("Error al crear categoría:", error);
            alert("Error de conexión con el servidor.");
          }
        }
      }, 200);
      return;
    }

    let datosActualizados = { ...nuevoProducto, [name]: value };

    if (name === 'precio_compra' || name === 'porcentaje_ganancia') {
      const costo = parseFloat(datosActualizados.precio_compra) || 0;
      const porcentaje = parseFloat(datosActualizados.porcentaje_ganancia) || 0;
      if (costo > 0 && porcentaje > 0) {
        datosActualizados.precio_venta = Math.round(costo + (costo * (porcentaje / 100)));
      }
    }
    setNuevoProducto(datosActualizados);
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setNuevoProducto({
      id: '', codigo_barras: '', nombre: '', precio_compra: '', precio_venta: '',
      stock_actual: '', stock_minimo: '', porcentaje_ganancia: '',
      categoria_id: categorias[0]?.id || '', proveedor: '', unidad_medida: 'unidad'
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (prod) => {
    setModoEdicion(true);
    setNuevoProducto({ ...prod, porcentaje_ganancia: '', unidad_medida: prod.unidad_medida || 'unidad' });
    setMostrarModal(true);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('tokenMinimarket');
      const productoAGuardar = { ...nuevoProducto, empresa_id: usuarioActivo.empresa_id };

      let url = 'https://api-minimarket-rc.onrender.com/api/productos';
      let metodo = 'POST';

      if (modoEdicion) {
        url = `https://api-minimarket-rc.onrender.com/api/productos/${nuevoProducto.id}`;
        metodo = 'PUT';
      }

      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(productoAGuardar)
      });

      if (respuesta.ok) {
        setMostrarModal(false);
        cargarProductos();
        alert(modoEdicion ? "¡Producto actualizado!" : "¡Producto registrado!");
      } else { alert("Hubo un error al guardar los datos."); }
    } catch (error) { console.error(error); }
  };

  const productosFiltrados = productos.filter(prod =>
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    prod.codigo_barras.includes(busqueda)
  );

  const capitalTotal = productosFiltrados.reduce((suma, p) => suma + (Number(p.precio_compra) * Number(p.stock_actual)), 0);
  const gananciaPotencial = productosFiltrados.reduce((suma, p) => suma + ((Number(p.precio_venta) - Number(p.precio_compra)) * Number(p.stock_actual)), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2>📦 Gestión de Inventario</h2>
        <input type="text" placeholder="🔍 Buscar por nombre o código..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ width: '300px', padding: '10px', borderRadius: '20px' }} />
        <button className="btn-primary" onClick={abrirModalNuevo}>+ Nuevo Producto</button>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="panel" style={{ flex: 1, minWidth: '200px', borderLeft: '4px solid var(--text-dim)' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>Capital Invertido (Costo)</p>
          <h3 style={{ margin: '5px 0 0 0', color: 'white' }}>Gs. {capitalTotal.toLocaleString('es-PY')}</h3>
        </div>
        <div className="panel" style={{ flex: 1, minWidth: '200px', borderLeft: '4px solid var(--accent)' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>Ganancia Potencial Bruta</p>
          <h3 style={{ margin: '5px 0 0 0', color: 'white' }}>Gs. {gananciaPotencial.toLocaleString('es-PY')}</h3>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Cód. Barras</th>
              <th>Producto</th>
              <th style={{ textAlign: 'right' }}>Costo</th>
              <th style={{ textAlign: 'right' }}>Precio Venta</th>
              <th style={{ textAlign: 'right' }}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((prod) => (
              <tr key={prod.id} onDoubleClick={() => abrirModalEditar(prod)} title="Doble clic para editar" style={{ cursor: 'pointer' }}>
                <td>{prod.codigo_barras}</td>
                <td>{prod.nombre}</td>
                <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>Gs. {Number(prod.precio_compra).toLocaleString('es-PY')}</td>
                <td className="price" style={{ textAlign: 'right' }}>Gs. {Number(prod.precio_venta).toLocaleString('es-PY')}</td>
                <td style={{ textAlign: 'right' }}>
                  {Number(prod.stock_actual)} {prod.unidad_medida === 'kg' ? 'Kg' : (prod.unidad_medida === 'litro' ? 'L' : 'unid.')}
                </td>
              </tr>
            ))}
            {productosFiltrados.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron productos.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modoEdicion ? '✏️ Editar Producto' : '📦 Registrar Producto'}</h3>
              <button className="btn-close" onClick={() => { setMostrarModal(false); setMostrarScanner(false); }}>×</button>
            </div>
            <form onSubmit={guardarProducto}>
              <div className="form-grid">
                <div className="form-group full-width"><label>Nombre del Producto</label><input type="text" name="nombre" value={nuevoProducto.nombre} onChange={manejarCambioInput} required /></div>
                
                <div className="form-group">
                  <label>Código de Barras</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" name="codigo_barras" value={nuevoProducto.codigo_barras} onChange={manejarCambioInput} required style={{ flex: 1 }} />
                    <button 
                      type="button" 
                      onClick={() => setMostrarScanner(!mostrarScanner)}
                      style={{ padding: '0 15px', backgroundColor: '#4CAF50', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
                    >
                      📷
                    </button>
                  </div>
                </div>

                {mostrarScanner && (
                  <div className="form-group full-width" style={{ textAlign: 'center', backgroundColor: '#fff', padding: '10px', borderRadius: '8px' }}>
                    <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
                    <button 
                      type="button" 
                      onClick={() => setMostrarScanner(false)}
                      style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Cancelar Escaneo
                    </button>
                  </div>
                )}

                <div className="form-group">
                  <label>Tipo de Venta (Medida)</label>
                  <select
                    name="unidad_medida"
                    value={nuevoProducto.unidad_medida}
                    onChange={manejarCambioInput}
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-base)', color: 'white' }}
                  >
                    <option value="unidad">Unidad / Paquete</option>
                    <option value="kg">Kilogramo (Kg) - Granel</option>
                    <option value="litro">Litro (L)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Stock Actual</label>
                  <input type="number" step="any" name="stock_actual" value={nuevoProducto.stock_actual} onChange={manejarCambioInput} required />
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      name="categoria_id"
                      value={nuevoProducto.categoria_id}
                      onChange={manejarCambioInput}
                      style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-base)', color: 'white' }}
                      required
                    >
                      <option value="" disabled>Selecciona una categoría</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={crearNuevaCategoriaDirecto}
                      style={{ padding: '0 15px', backgroundColor: 'var(--accent)', border: 'none', borderRadius: '6px', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}
                      title="Agregar nueva categoría"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="form-group"><label>Proveedor (Opcional)</label><input type="text" name="proveedor" value={nuevoProducto.proveedor} onChange={manejarCambioInput} placeholder="Ej. Coca-Cola" /></div>

                <div className="form-group full-width" style={{ borderTop: '1px dashed #444', paddingTop: '15px', marginTop: '10px' }}>
                  <label style={{ color: 'var(--accent)' }}>Finanzas del Producto (Por {nuevoProducto.unidad_medida === 'kg' ? 'Kilo' : (nuevoProducto.unidad_medida === 'litro' ? 'Litro' : 'Unidad')})</label>
                </div>

                <div className="form-group"><label>Precio Compra (Costo Gs.)</label><input type="number" name="precio_compra" value={nuevoProducto.precio_compra} onChange={manejarCambioInput} required /></div>
                <div className="form-group"><label>% Ganancia Deseada (Opcional)</label><input type="number" name="porcentaje_ganancia" value={nuevoProducto.porcentaje_ganancia} onChange={manejarCambioInput} placeholder="Ej. 30" /></div>
                <div className="form-group full-width"><label>Precio Venta Final (Gs.)</label><input type="number" name="precio_venta" value={nuevoProducto.precio_venta} onChange={manejarCambioInput} required style={{ backgroundColor: '#2a2a2a', fontWeight: 'bold', color: 'var(--accent)' }} /></div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>{modoEdicion ? 'Guardar Cambios' : 'Guardar en Inventario'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;