import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/auth';

export default function EditSale() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService.transacciones
      .retrieve(id)
      .then((data) => {
        if (!active) return;
        setForm({ estado: data.estado || '', metodo_pago: data.metodo_pago || '' });
      })
      .catch(() => setError('No se pudo cargar la venta'))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await adminService.transacciones.partialUpdate(id, form);
      navigate('/admin/ventas');
    } catch (err) {
      setError(err?.detail || 'No se pudo actualizar la venta');
    }
  };

  if (loading || !form) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Cargando datos de la venta...
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: 800, 
      margin: '2.5rem auto', 
      padding: '0 1.5rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: '2rem',
        border: '1px solid #eaeaea'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <button 
            onClick={() => navigate('/admin/ventas')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginRight: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            margin: 0,
            color: '#1a1a1a'
          }}>
            Editar venta #{id}
          </h1>
        </div>
        
        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '12px 16px', 
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #ffcdd2',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#c62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: '#333',
              marginBottom: '4px'
            }}>
              Estado *
            </label>
            <select 
              name="estado" 
              value={form.estado} 
              onChange={onChange} 
              required 
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none',
                background: 'white',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1e88e5';
                e.target.style.boxShadow = '0 0 0 2px rgba(30, 136, 229, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">Seleccionar estado</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="en_transito">En transito</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: '#333',
              marginBottom: '4px'
            }}>
              Método de pago
            </label>
            <select 
              name="metodo_pago" 
              value={form.metodo_pago} 
              onChange={onChange}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none',
                background: 'white',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1e88e5';
                e.target.style.boxShadow = '0 0 0 2px rgba(30, 136, 229, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">Seleccionar método</option>
              <option value="tarjeta_credito">Tarjeta de crédito</option>
              <option value="tarjeta_debito">Tarjeta de débito</option>
              <option value="paypal">PayPal</option>
              <option value="transferencia">Transferencia bancaria</option>
              <option value="efectivo">Efectivo</option>
              <option value="criptomoneda">Criptomoneda</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f0f0f0'
          }}>
            <button
              type="button"
              onClick={() => navigate('/admin/ventas')}
              style={{ 
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                background: 'transparent',
                color: '#666',
                fontWeight: 600,
                border: '1px solid #ddd',
                cursor: 'pointer',
                transition: 'background-color 0.2s, border-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f5f5f5';
                e.target.style.borderColor = '#ccc';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#ddd';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                background: '#1e88e5',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s, transform 0.1s',
                boxShadow: '0 2px 4px rgba(30, 136, 229, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1976d2'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#1e88e5'}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}