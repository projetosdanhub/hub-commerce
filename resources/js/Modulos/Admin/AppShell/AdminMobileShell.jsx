import React from 'react';
import { ExternalLink, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { mobileNavigation } from './AdminNavigation';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { IconLink } from '../DesignSystem/primitives/IconLink';

const isActive = (pathname, item) => (
  item.exact ? pathname === item.path : pathname.startsWith(item.path)
);

export const AdminMobileShell = ({ children, onLogout }) => {
  const location = useLocation();

  return (
    <div className="hub-mobile-shell">
      <header className="hub-mobile-topbar">
        <span className="hub-mobile-brand">
          <span className="hub-admin-brand-mark" aria-hidden="true">HC</span>
          HUB Commerce
        </span>
        <div className="flex items-center gap-1">
          <IconLink
            icon={ExternalLink}
            label="Acessar vitrine em uma nova aba"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          />
          <IconButton icon={LogOut} label="Sair do painel" onClick={onLogout} />
        </div>
      </header>

      <main className="hub-mobile-content">{children}</main>

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
