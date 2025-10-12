import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminPage({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!user || !user.is_staff) navigate('/');
  }, [user, navigate]);

  return (
    <div
      style={{
        minHeight: 'calc(100vh)',
        display: 'flex', // flex para que el main se ajuste al ancho del sidebar
      }}
    >
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <main
        style={{
          padding: '1.25rem',
          flex: '1 1 auto', // el main ocupa el resto del espacio y se ajusta
          transition: 'padding 1.5s cubic-bezier(.4,2,.6,1)',
        }}
      >
        {children}
      </main>

      <style>
        {`
          @media (max-width: 900px) {
            main {
              padding: 1rem;
            }
          }
        `}
      </style>
    </div>
  );
}