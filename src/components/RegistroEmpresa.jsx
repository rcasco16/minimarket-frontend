import React, { useState } from 'react';

function RegistroEmpresa() {
    // 👇 Agregamos 'plan' al estado inicial (por defecto 'basico')
    const [datos, setDatos] = useState({
        nombre_comercial: '',
        nombre_admin: '',
        email: '',
        password: '',
        plan: 'basico' 
    });

    const registrar = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('https://api-minimarket-rc.onrender.com/api/auth/registrar-cliente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            if (res.ok) {
                alert(`¡Nuevo cliente activado con el Plan ${datos.plan.toUpperCase()}! Ya puede iniciar sesión.`);
                // 👇 Reseteamos el formulario incluyendo el plan
                setDatos({ nombre_comercial: '', nombre_admin: '', email: '', password: '', plan: 'basico' });
            } else {
                alert("Error al registrar. Revisa si el correo ya existe.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', backgroundColor: '#1a1a1a', borderRadius: '12px', color: 'white' }}>
            <h2 style={{ textAlign: 'center', color: 'var(--accent)' }}>🚀 Alta de Nuevo Cliente</h2>
            <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', marginBottom: '25px' }}>RC Creación de Software - Panel Master</p>
            
            <form onSubmit={registrar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Nombre del Negocio / Minimarket</label>
                    <input type="text" value={datos.nombre_comercial} onChange={e => setDatos({...datos, nombre_comercial: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#000', color: 'white', marginTop: '5px' }} />
                </div>
                
                <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Nombre del Dueño (Admin)</label>
                    <input type="text" value={datos.nombre_admin} onChange={e => setDatos({...datos, nombre_admin: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#000', color: 'white', marginTop: '5px' }} />
                </div>
                
                <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Correo de Acceso</label>
                    <input type="email" value={datos.email} onChange={e => setDatos({...datos, email: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#000', color: 'white', marginTop: '5px' }} />
                </div>
                
                <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Contraseña Temporal</label>
                    <input type="text" value={datos.password} onChange={e => setDatos({...datos, password: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#000', color: 'white', marginTop: '5px' }} />
                </div>

                {/* 👇 NUEVO: Selector de Plan del Cliente 👇 */}
                <div style={{ padding: '15px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid #3b82f6', marginTop: '10px' }}>
                    <label style={{ fontSize: '13px', color: '#60a5fa', fontWeight: 'bold' }}>Suscripción / Plan Asignado</label>
                    <select 
                        value={datos.plan} 
                        onChange={e => setDatos({...datos, plan: e.target.value})} 
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #3b82f6', backgroundColor: '#000', color: 'white', marginTop: '10px', fontSize: '14px', cursor: 'pointer' }}
                    >
                        <option value="basico">📦 Plan Básico (1 Usuario, Sin Gráficos)</option>
                        <option value="emprendedor">🚀 Plan Emprendedor (Multi-usuario, Gráficos PRO)</option>
                    </select>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '15px', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}>
                    Activar Cliente
                </button>
            </form>
        </div>
    );
}

export default RegistroEmpresa;