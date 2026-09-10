import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export const LocalNavigation = ({ tabs, activeTab, onChange }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Basic scroll into view logic for active tab in mobile (optional enhancement)
    const activeEl = containerRef.current?.querySelector('[aria-selected="true"]');
    if (activeEl && containerRef.current) {
      // scroll container logic could go here if needed
    }
  }, [activeTab]);

  const handleKeyDown = (e, index) => {
    let newIndex;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    }
    
    if (newIndex !== undefined) {
      e.preventDefault();
      const newTab = tabs[newIndex].id;
      onChange(newTab);
      
      // Attempt to focus the new tab
      const tabElements = containerRef.current?.querySelectorAll('[role="tab"]');
      if (tabElements && tabElements[newIndex]) {
        tabElements[newIndex].focus();
      }
    }
  };

  return (
    <div 
      className="flex overflow-x-auto thin-scroll bg-[var(--hub-surface-subtle)] p-1 rounded-[var(--hub-radius-md)] mb-8 w-max max-w-full border border-[var(--hub-border-subtle)]"
      role="tablist"
      aria-label="Navegação local"
      ref={containerRef}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`relative px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap outline-none focus-visible:ring-[var(--hub-focus-ring)] z-10 ${
              isActive 
                ? 'text-[var(--hub-primary)]' 
                : 'text-[var(--hub-text-secondary)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-surface)]/50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="localNavigationActiveTab"
                className="absolute inset-0 bg-[var(--hub-primary-soft)] rounded-[6px] border border-[var(--hub-primary)]/20"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                style={{ zIndex: -1 }}
              />
            )}
            {tab.icon && <tab.icon size={16} strokeWidth={isActive ? 2 : 1.8} />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
