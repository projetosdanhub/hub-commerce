import React from 'react';

export const SectionTabs = ({ items, value, onChange, ariaLabel }) => (
  <nav className="hub-section-tabs" aria-label={ariaLabel}>
    <div className="hub-section-tabs-list" role="tablist">
      {items.map((item) => {
        const Icon = item.icon;
        const active = value === item.value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            className="hub-section-tab"
            data-active={active}
            onClick={() => onChange(item.value)}
          >
            {Icon ? <Icon aria-hidden="true" size={16} /> : null}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);
