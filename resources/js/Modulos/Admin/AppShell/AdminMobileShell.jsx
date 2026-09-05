import React from 'react';
import { LogOut, Moon, Sun, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { mobileNavigation } from './AdminNavigation';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { useAdminPageRefresh } from '../DesignSystem/patterns/GlobalPageRefresh';
import { readMotionDurationMs } from '../DesignSystem/patterns/interactionLifecycle';

const isActive = (pathname, item) => (
  item.exact ? pathname === item.path : pathname.startsWith(item.path)
);

export const AdminMobileShell = ({ children, onLogout, theme, onToggleTheme }) => {
  const location = useLocation();
  const { isRefreshing, refresh } = useAdminPageRefresh();
  const shouldReduceMotion = useReducedMotion();
  const routeMotionDuration = readMotionDurationMs('--hub-motion-normal', document.documentElement) / 1000;

  return (
    <div className="hub-mobile-shell">
      <header className="hub-mobile-topbar">
        <span className="hub-mobile-brand">
          <span className="hub-admin-brand-mark" aria-hidden="true">HC</span>
          HUB Commerce
        </span>
        <div className="flex items-center gap-1">
          <IconButton icon={theme === 'light' ? Moon : Sun} label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'} onClick={onToggleTheme} />
          <IconButton
            icon={RefreshCw}
            label="Atualizar dados desta tela"
            loading={isRefreshing}
            onClick={refresh}
          />
          <IconButton icon={LogOut} label="Sair do painel" onClick={onLogout} />
        </div>
      </header>

      <motion.main
        key={location.pathname}
        className="hub-mobile-content"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : routeMotionDuration, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.main>

      <nav className="hub-mobile-bottom-nav" aria-label="Navegação móvel">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(location.pathname, item);

          return (
            <Link
              key={item.path}
              className="hub-mobile-nav-link"
              data-active={active}
              aria-current={active ? 'page' : undefined}
              to={item.path}
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
