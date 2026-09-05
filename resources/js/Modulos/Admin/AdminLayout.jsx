import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import AdminLogin from './AdminLogin';
import api from '../../api';
import { adminQueryKeys } from '../../queryClient';
import { fetchAdminDashboard } from './AdminDashboard';
import { AdminDesktopShell } from './AppShell/AdminDesktopShell';
import { AdminMobileShell } from './AppShell/AdminMobileShell';
import { AdminPageRefreshProvider } from './DesignSystem/patterns/GlobalPageRefresh';
import { resolveInitialAdminTheme } from './DesignSystem/patterns/appearancePreference';

const getInitialAdminTheme = () => {
  try {
    const matchMedia = typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : null;

    return resolveInitialAdminTheme({
      storedTheme: window.localStorage.getItem('hub_admin_theme'),
      viewportIsMobile: Boolean(matchMedia?.('(max-width: 1023px)').matches),
      prefersLight: Boolean(matchMedia?.('(prefers-color-scheme: light)').matches),
    });
  } catch {
    return 'dark';
  }
};

const useMobileShell = () => {
  const query = '(max-width: 1023px)';
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateViewport = (event) => setIsMobile(event.matches);

    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  return isMobile;
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useMobileShell();
  const [theme, setTheme] = useState(getInitialAdminTheme);
  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');
  useEffect(() => {
    try { localStorage.setItem('hub_admin_theme', theme); } catch { /* Theme still works for this session. */ }
  }, [theme]);
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

  return (
    <div className="hub-admin" data-theme={theme}>
      <div className="hub-admin-shell">
        <AdminPageRefreshProvider>
          {isMobile ? (
            <AdminMobileShell onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme}>
              <Outlet />
            </AdminMobileShell>
          ) : (
            <AdminDesktopShell onLogout={handleLogout} onWarmRoute={warmRoute} theme={theme} onToggleTheme={toggleTheme}>
              <Outlet />
            </AdminDesktopShell>
          )}
        </AdminPageRefreshProvider>
      </div>
    </div>
  );
};

export default AdminLayout;
