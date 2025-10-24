import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // --- PALETA DE COLORES (Definida como constantes separadas para fácil referencia) ---
  const PRIMARY_COLOR = '#FF4136'; // Rojo vibrante/energía
  const SECONDARY_COLOR = '#0074D9'; // Azul eléctrico
  const TEXT_COLOR = '#333333';
  const ERROR_COLOR = '#D9534F';
  const SUCCESS_COLOR = '#5CB85C';
  const BORDER_COLOR = '#DDDDDD';
  const BG_LIGHT = '#F4F4F4';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const data = await authService.login(email, password);
      login(data.user, data.access);
      setSuccess(true);
      // Retraso breve para que el usuario vea el mensaje de éxito antes de la redirección
      setTimeout(() => navigate('/'), 1000); 
    } catch (err) {
      const data = err?.response?.data;
      if (data) {
        const msg =
          typeof data === 'object'
            ? Object.entries(data)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                .join(' | ')
            : String(data);
        setError(msg);
      } else {
        setError(err.message || 'Error de autenticación. Verifica tus credenciales.');
      }
    }
  };

  return (
    // CONTENEDOR PRINCIPAL
    <div 
      style={{
        maxWidth: 450,
        margin: '3rem auto',
        padding: '40px 30px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        fontFamily: 'sans-serif',
      }}
    >
      {/* TÍTULO */}
      <h2 
        style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '2rem',
          fontWeight: 800,
          color: TEXT_COLOR,
          borderBottom: `3px solid ${PRIMARY_COLOR}`,
          paddingBottom: '10px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        INICIO DE SESION
      </h2>

      <form onSubmit={handleSubmit}>
        {/* INPUT DE CORREO */}
        <input
          type="email"
          placeholder="Tu Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            display: 'block',
            width: '92%',
            padding: '12px 15px',
            marginBottom: '20px',
            border: `2px solid ${BORDER_COLOR}`,
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            outline: 'none',
            // Nota: Los pseudo-selectores como :hover o :focus no funcionan directamente en estilos en línea, solo con CSS externo o librerías específicas.
          }}
        />

        {/* INPUT DE CONTRASEÑA */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            display: 'block',
            width: '92%',
            padding: '12px 15px',
            marginBottom: '20px',
            border: `2px solid ${BORDER_COLOR}`,
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            outline: 'none',
          }}
        />

        {/* BOTÓN DE ENTRAR */}
        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: PRIMARY_COLOR,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'background-color 0.3s', // Mantengo transition aunque :hover no funciona directo
          }}
        >
          INICIAR SESION
        </button>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div 
            style={{ 
              padding: '10px',
              marginTop: '15px',
              borderRadius: '6px',
              fontWeight: 600,
              textAlign: 'center',
              backgroundColor: '#F2DEDE',
              color: ERROR_COLOR,
              border: `1px solid ${ERROR_COLOR}`,
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* MENSAJE DE ÉXITO */}
        {success && (
          <div 
            style={{ 
              padding: '10px',
              marginTop: '15px',
              borderRadius: '6px',
              fontWeight: 600,
              textAlign: 'center',
              backgroundColor: '#D9EDF7',
              color: SECONDARY_COLOR,
              border: `1px solid ${SECONDARY_COLOR}`,
            }}
          >
            ✅ ¡Login Exitoso! Redirigiendo...
          </div>
        )}
      </form>

      {/* ENLACES RÁPIDOS */}
      <div 
        style={{ 
          marginTop: 25,
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 15,
          borderTop: '1px solid #EEEEEE',
        }}
      >
        <Link 
          to="/register" 
          style={{
            color: SECONDARY_COLOR,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          ⭐ Crear una Nueva Cuenta
        </Link>
        <Link 
          to="/password-reset" 
          style={{ 
            color: SECONDARY_COLOR,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          🔑 ¿Olvidaste tu Acceso?
        </Link>
      </div>
    </div>
  );
}

export default Login;
