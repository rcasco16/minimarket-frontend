import React, { useState, useEffect } from 'react';

function Inventario({ productos, usuarioActivo, cargarProductos }) {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  // 👇 NUEVO: Estado para guardar la lista de categorías
  const [categorias, setCategorias] = useState([]);

  const [nuevoProducto, setNuevoProducto] = useState({
    id: '', codigo_barras: '', nombre: '', precio_compra: '', precio_venta: '', stock_actual: '', stock_minimo: '', porcentaje_ganancia: '', categoria_id: '', proveedor: ''
  });

  // 👇 NUEVO: Función para buscar las categorías de esta empresa
  const cargarCategorias = async () => {
    try {
      const token = localStorage.getItem('tokenMinimarket');
      // 👇 URL ACTUALIZADA (1/4) 👇
      const res = await fetch(`https://api-minimarket-rc.onrender.com/api/categorias/empresa/${usuarioActivo.empresa_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
        // Si hay categorías, seleccionamos la primera por defecto
        if (data.length > 0 && !nuevoProducto.categoria_id) {
          setNuevoProducto(prev => ({ ...prev, categoria_id: data[0].id }));
        }
      }
    } catch (error) { console.error(error); }
  };

  // Cargamos las categorías apenas se abre el inventario
  useEffect(() => {
    cargarCategorias();
  }, []);


  const manejarCambioInput = async (e) => {
    const { name, value } = e.target;

    // 👇 NUEVO: Interceptamos si el usuario quiere crear una categoría nueva
    if (name === 'categoria_id' && value === 'nueva') {
      const nombreNuevaCat = window.prompt("Ingresa el nombre de la nueva categoría:");
      
      if (nombreNuevaCat && nombreNuevaCat.trim() !== '') {
        try {
          const token = localStorage.getItem('tokenMinimarket');
          // 👇 URL ACTUALIZADA (2/4) 👇
          const res = await fetch('https://api-minimarket-rc.onrender.com/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nombre: nombreNuevaCat, empresa_id: usuarioActivo.empresa_id })
          });
          
          if (res.ok) {
            const data = await res.json();
            // Refrescamos la lista de categorías y seleccionamos la nueva
            cargarCategorias();
            setNuevoProducto({ ...nuevoProducto, categoria_id: data.id });
          }
        } catch (error) { alert("Error al crear categoría"); }
      } else {
        // Si cancela la ventanita, volvemos a la categoría por defecto
        setNuevoProducto({ ...nuevoProducto, categoria_id: categorias[0]?.id || '' });
      }
      return; // Salimos de la función para que no se guarde la palabra "nueva"
    }

    let datosActualizados = { ...nuevoProducto, [name]: value };
    
    // Cálculo de porcentaje
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
    setNuevoProducto({ id: '', codigo_barras: '', nombre: '', precio_compra: '', precio_venta: '', stock_actual: '', stock_minimo: '', porcentaje_ganancia: '', categoria_id: categorias[0]?.id || '', proveedor: '' });
    setMostrarModal(true);
  };

  const abrirModalEditar = (prod) => {
    setModoEdicion(true);
    setNuevoProducto({ ...prod, porcentaje_ganancia: '' });
    setMostrarModal(true);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('tokenMinimarket');
      const productoAGuardar = { ...nuevoProducto, empresa_id: usuarioActivo.empresa_id };
      
      // 👇 URL ACTUALIZADA (3/4) 👇
      let url = 'https://api-minimarket-rc.onrender.com/api/productos';
      let metodo = 'POST';

      if (modoEdicion) {
        // 👇 URL ACTUALIZADA (4/4) 👇
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
                <td style={{ textAlign: 'right' }}>{prod.stock_actual} unid.</td>
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
              <button className="btn-close" onClick={() => setMostrarModal(false)}>×</button>
            </div>
            <form onSubmit={guardarProducto}>
              <div className="form-grid">
                <div className="form-group full-width"><label>Nombre del Producto</label><input type="text" name="nombre" value={nuevoProducto.nombre} onChange={manejarCambioInput} required /></div>
                <div className="form-group"><label>Código de Barras</label><input type="text" name="codigo_barras" value={nuevoProducto.codigo_barras} onChange={manejarCambioInput} required /></div>
                <div className="form-group"><label>Stock Actual</label><input type="number" name="stock_actual" value={nuevoProducto.stock_actual} onChange={manejarCambioInput} required /></div>
                
                {/* 👇 NUEVO: El Select ahora se dibuja leyendo la base de datos 👇 */}
                <div className="form-group">
                  <label>Categoría</label>
                  <select name="categoria_id" value={nuevoProducto.categoria_id} onChange={manejarCambioInput} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-base)', color: 'white' }} required>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                    <option value="nueva" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>+ Agregar nueva...</option>
                  </select>
                </div>

                <div className="form-group"><label>Proveedor (Opcional)</label><input type="text" name="proveedor" value={nuevoProducto.proveedor} onChange={manejarCambioInput} placeholder="Ej. Coca-Cola" /></div>
                <div className="form-group full-width" style={{ borderTop: '1px dashed #444', paddingTop: '15px', marginTop: '10px' }}><label style={{ color: 'var(--accent)' }}>Finanzas del Producto</label></div>
                <div className="form-group"><label>Precio Compra (Costo Gs.)</label><input type="number" name="precio_compra" value={nuevoProducto.precio_compra} onChange={manejarCambioInput} required /></div>
                <div className="form-group"><label>% Ganancia Deseada (Opcional)</label><input type="number" name="porcentaje_ganancia" value={nuevoProducto.porcentaje_ganancia} onChange={manejarCambioInput} placeholder="Ej. 30" /></div>
                <div className="form-group full-width"><label>Precio Venta Final (Gs.)</label><input type="number" name="precio_venta" value={nuevoProducto.precio_venta} onChange={manejarCambioInput} required style={{ backgroundColor: '#2a2a2a', fontWeight: 'bold', color: 'var(--accent)' }}/></div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>{modoEdicion ? 'Guardar Cambios' : 'Guardar en Inventario'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;