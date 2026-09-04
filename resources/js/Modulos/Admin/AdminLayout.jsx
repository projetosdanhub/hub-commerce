import React, { useCallback, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import AdminLogin from './AdminLogin';
import api from '../../api';
import { adminQueryKeys } from '../../queryClient';
import { fetchAdminDashboard } from './AdminDashboard';
import { AdminDesktopShell } from './AppShell/AdminDesktopShell';
import { AdminMobileShell } from './AppShell/AdminMobileShell';

const AdminLayout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => sessionStorage.getItem('hub_admin_token'));

  const handleLogout = useCallback(async () => {
    try {
      await api.post('/admin/logout');
    } finally {
      sessionStorage.removeItem('hub_admin_token');
      queryClient.removeQueries({ queryKey: ['admin'] });
      setToken(null);
      navigate('/admin/login', { replace: true });
    }
  }, [navigate, queryClient]);

  const warmRoute = useCallback((path) => {
    if (path === '/admin') {
      queryClient.prefetchQuery({
        queryKey: adminQueryKeys.dashboard(),
        queryFn: fetchAdminDashboard,
      });
    }
  }, [queryClient]);

  if (!token) {
    return (
      <AdminLogin
        onLoginSuccess={(newToken) => {
          sessionStorage.setItem('hub_admin_token', newToken);
          setToken(newToken);
          navigate('/admin', { replace: true });
        }}
      />
    );
  }

  const content = <Outlet />;

  return (
    <div className="hub-admin">
      <div className="hub-admin-shell">
        <AdminDesktopShell onLogout={handleLogout} onWarmRoute={warmRoute}>
          {content}
        </AdminDesktopShell>
        <AdminMobileShell onLogout={handleLogout}>
          {content}
        </AdminMobileShell>
      </div>
    </div>
  );
};

export default AdminLayout;
