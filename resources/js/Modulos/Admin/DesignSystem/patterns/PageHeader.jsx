import React from 'react';

export const PageHeader = ({ title, description, actions, icon: Icon, eyebrow }) => (
  <header className="hub-page-heading">
    <div>
      {eyebrow ? <p className="hub-page-eyebrow">{eyebrow}</p> : null}
      <h1 className="hub-page-title">
        {Icon ? <Icon aria-hidden="true" size={28} strokeWidth={1.8} /> : null}
        {title}
      </h1>
      {description ? <p className="hub-page-description">{description}</p> : null}
    </div>
    {actions ? <div className="hub-page-actions">{actions}</div> : null}
  </header>
);
