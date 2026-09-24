import React from "react";
import Icon from "./Icon.jsx";

// Renders an icon button with an accessible label and hover title.
export function IconButton({
  icon,
  label,
  children,
  className = "",
  ...props
}) {
  return (
    <button
      className={`icon-button ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon name={icon} />
      {children}
    </button>
  );
}
// Marks the active drill level; the panel arrow handles navigation.
export function Breadcrumbs({ items, active = 0 }) {
  return (
    <div className="breadcrumbs">
      <Icon name="tree" size={16} />
      {items.map((item, i) => (
        <React.Fragment key={item}>
          {i > 0 && <Icon name="arrow" size={15} />}
          <span
            className={i === active ? "current" : ""}
            aria-current={i === active ? "step" : undefined}
          >
            {item}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
// Provides a shared card layout with a title, breadcrumbs, and optional expand action.
export function Panel({
  title,
  children,
  crumbs,
  active = 0,
  actions,
  onExpand,
  className = "",
  id,
}) {
  return (
    <section className={`panel ${className}`} id={id} aria-label={title}>
      <header className="panel-header">
        <h2>{title}</h2>
        {actions}
        {onExpand && (
          <div className="panel-actions">
            <IconButton
              icon="grid"
              label={`Expand ${title}`}
              onClick={onExpand}
            />
          </div>
        )}
      </header>
      {crumbs && <Breadcrumbs items={crumbs} active={active} />}
      {children}
    </section>
  );
}
