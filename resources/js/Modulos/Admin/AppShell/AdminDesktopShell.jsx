import React, { useEffect, useState } from 'react';
import { CircleUserRound, LogOut, PanelLeftClose, PanelLeftOpen, RefreshCw } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { AdminNavigation } from './AdminNavigation';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { Tooltip } from '../DesignSystem/primitives/Tooltip';
import { useAdminPageRefresh } from '../DesignSystem/patterns/GlobalPageRefresh';

const SIDEBAR_STORAGE_KEY = 'hub_admin_sidebar_collapsed';

export const AdminDesktopShell = ({ children, onLogout, onWarmRoute }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true');
  const shouldReduceMotion = useReducedMotion();
  const { isRefreshing, refresh } = useAdminPageRefresh();

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <div className="hub-admin-desktop" data-collapsed={collapsed}>
      <aside className="hub-admin-sidebar">
        <div className="hub-admin-brand">
          <span className="hub-admin-brand-mark" aria-hidden="true">HC</span>
          <div className="hub-admin-brand-copy">
            <p className="hub-admin-brand-name">HUB Commerce</p>
            <p className="hub-admin-brand-subtitle">Operação da loja</p>
          </div>
        </div>

        <div className="hub-sidebar-scroll">
          <AdminNavigation collapsed={collapsed} onWarmRoute={onWarmRoute} />
        </div>

        <footer className="hub-sidebar-footer">
          <Tooltip content="Abrir vitrine em uma nova aba">
            <a
              className="hub-sidebar-store"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <CircleUserRound aria-hidden="true" size={16} />
              <span className="hub-sidebar-store-label">Acessar vitrine</span>
            </a>
          </Tooltip>
          <IconButton
            icon={collapsed ? PanelLeftOpen : PanelLeftClose}
            label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            onClick={() => setCollapsed((value) => !value)}
            className="hub-sidebar-toggle"
          />
        </footer>
      </aside>

      <div className="hub-admin-main">
        <header className="hub-admin-topbar">
          <div className="hub-topbar-actions">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={isRefreshing}
              onClick={refresh}
            >
              Atualizar
            </Button>
            <IconButton icon={LogOut} label="Sair do painel" onClick={onLogout} />
          </div>
        </header>

        <motion.main
          key={location.pathname}
          className="hub-admin-content"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};
