import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const AdminPageRefreshContext = createContext(null);

export const AdminPageRefreshProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const refreshersRef = useRef(new Set());
  const refreshingRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const register = useCallback((refresh) => {
    refreshersRef.current.add(refresh);
    return () => refreshersRef.current.delete(refresh);
  }, []);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    setIsRefreshing(true);

    try {
      const pageRefreshers = [...refreshersRef.current];

      if (pageRefreshers.length) {
        await Promise.all(pageRefreshers.map((pageRefresh) => pageRefresh()));
        return;
      }

      await queryClient.refetchQueries({ type: 'active' });
    } finally {
      refreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const value = useMemo(() => ({ isRefreshing, refresh, register }), [isRefreshing, refresh, register]);

  return (
    <AdminPageRefreshContext.Provider value={value}>
      {children}
    </AdminPageRefreshContext.Provider>
  );
};

export const useAdminPageRefresh = () => {
  const context = useContext(AdminPageRefreshContext);

  if (!context) {
    throw new Error('useAdminPageRefresh deve ser usado dentro de AdminPageRefreshProvider.');
  }

  return context;
};

export const useRegisterAdminPageRefresh = (refresh) => {
  const { register } = useAdminPageRefresh();

  React.useEffect(() => {
    if (!refresh) return undefined;
    return register(refresh);
  }, [refresh, register]);
};
