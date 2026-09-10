import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Boxes,
  ClipboardList,
  Cog,
  LayoutDashboard,
  Megaphone,
  Gift,
  Handshake,
  Menu,
  Package,
  PanelsTopLeft,
  Settings2,
  ShoppingBag,
  Tags,
  Truck,
  Users,
} from 'lucide-react';

const navigationGroups = [
  {
    label: 'Visão geral',
    items: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
      { label: 'Pedidos', path: '/admin/pedidos', icon: ClipboardList },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { label: 'Produtos', path: '/admin/produtos', icon: Package },
      { label: 'Categorias', path: '/admin/categorias', icon: Tags },
      { label: 'Estoque', path: '/admin/estoque', icon: Boxes },
    ],
  },
  {
    label: 'Clientes e benefícios',
    items: [
      { label: 'Clientes', path: '/admin/clientes', icon: Users },
      { label: 'Benefícios & VIP', path: '/admin/beneficios', icon: Gift },
    ],
  },
  {
    label: 'Crescimento',
    items: [
      { label: 'Marketing', path: '/admin/marketing', icon: Megaphone },
      { label: 'Afiliados', path: '/admin/afiliados', icon: Handshake },
      { label: 'Pixels', path: '/admin/pixels', icon: PanelsTopLeft },
    ],
  },
  {
    label: 'Loja',
    items: [
      { label: 'Vitrine', path: '/admin/vitrine', icon: ShoppingBag },
      { label: 'Menus', path: '/admin/menus', icon: Menu },
      { label: 'Transportadoras', path: '/admin/transportadoras', icon: Truck },
      { label: 'Configurações', path: '/admin/configuracoes', icon: Settings2 },
    ],
  },
];

export const mobileNavigation = [
  { label: 'Início', path: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Pedidos', path: '/admin/pedidos', icon: ClipboardList },
  { label: 'Produtos', path: '/admin/produtos', icon: Package },
  { label: 'Clientes', path: '/admin/clientes', icon: Users },
  { label: 'Ajustes', path: '/admin/configuracoes', icon: Cog },
];

const isActive = (pathname, item) => (
  item.exact ? pathname === item.path : pathname.startsWith(item.path)
);

export const AdminNavigation = ({ collapsed = false, onNavigate, onWarmRoute }) => {
  const location = useLocation();

  return (
    <nav aria-label="Navegação principal">
      {navigationGroups.map((group) => (
        <section className="hub-nav-group" key={group.label}>
          <h2 className="hub-nav-group-title">{group.label}</h2>
          <ul className="hub-nav-list">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(location.pathname, item);

              return (
                <li key={item.path}>
                  <Link
                    className="hub-nav-link"
                    data-active={active}
                    aria-current={active ? 'page' : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    title={collapsed ? item.label : undefined}
                    to={item.path}
                    onMouseEnter={() => onWarmRoute?.(item.path)}
                    onFocus={() => onWarmRoute?.(item.path)}
                    onClick={onNavigate}
                  >
                    <Icon aria-hidden="true" className="hub-nav-icon" />
                    <span className="hub-nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
};
