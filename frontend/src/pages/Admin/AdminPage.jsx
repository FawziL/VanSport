import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import { locPath } from '@/utils/localePath';

export default function AdminPage({ children }) {
  const { user, initialLoading } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (initialLoading) return;
    if (!user || !user.isStaff) navigate(locPath('/'));
  }, [user, navigate, initialLoading]);

  if (initialLoading) return null;

  return (
    <div
      style={{
        minHeight: 'calc(100vh)',
        display: 'flex', // flex para que el main se ajuste al ancho del sidebar
      }}
    >
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        style={{
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
              padding: 0px;
            }
          }
        `}
      </style>
    </div>
  );
}
