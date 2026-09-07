import React from 'react';
import { ArrowRight, CircleAlert, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OperationalState = ({ icon: Icon, title, description, rule, links = [] }) => (
  <section className="hub-growth-state hub-surface" aria-live="polite">
    <div className="hub-growth-state-icon">
      <Icon aria-hidden="true" size={22} />
    </div>
    <div className="hub-growth-state-copy">
      <p className="hub-growth-state-kicker"><LockKeyhole aria-hidden="true" size={15} /> Operação em estruturação</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="hub-growth-rule">
        <CircleAlert aria-hidden="true" size={17} />
        <span>{rule}</span>
      </div>
      {links.length ? (
        <div className="hub-growth-links">
          {links.map(({ label, to }) => (
            <Link key={to} className="hub-growth-link" to={to}>
              {label}
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  </section>
);
