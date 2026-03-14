import React, { useState } from 'react';

function RegistroEmpresa() {
    const [datos, setDatos] = useState({
        nombre_comercial: '',
        nombre_admin: '',
        email: '',
        password: ''
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
                alert("¡Nuevo cliente activado! Ya puede iniciar sesión.");
                setDatos({ nombre_comercial: '', nombre_admin: '', email: '', password: '' });
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
            <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>RC Creación de Software - Panel Master</p>
            
            <form onSubmit={registrar} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ fontSize: '12px' }}>Nombre del Negocio / Minimarket</label>
                    <input type="text" value={datos.nombre_comercial} onChange={e => setDatos({...datos, nombre_comercial: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#000', color: 'white' }} />
                </div>
                <div>
                    <label style={{ fontSize: '12px' }}>Nombre del Dueño (Admin)</label>
                    <input type="text" value={datos.nombre_admin} onChange={e => setDatos({...datos, nombre_admin: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#000', color: 'white' }} />
                </div>
                <div>
                    <label style={{ fontSize: '12px' }}>Correo de Acceso</label>
                    <input type="email" value={datos.email} onChange={e => setDatos({...datos, email: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#000', color: 'white' }} />
                </div>
                <div>
                    <label style={{ fontSize: '12px' }}>Contraseña Temporal</label>
                    <input type="text" value={datos.password} onChange={e => setDatos({...datos, password: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#000', color: 'white' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '15px' }}>Activar Cliente</button>
            </form>
        </div>
    );
}

export default RegistroEmpresa;