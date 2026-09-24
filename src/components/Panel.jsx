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
// Shows clickable chart drill-down labels separated by arrows.
export function Breadcrumbs({ items, onSelect }) {
  return (
    <div className="breadcrumbs">
      <Icon name="tree" size={16} />
      {items.map((item, i) => (
        <React.Fragment key={item}>
          {i > 0 && <Icon name="arrow" size={15} />}
          <button
            className={i === 0 ? "current" : ""}
            onClick={() => onSelect?.(item)}
          >
            {item}
          </button>
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
  onDrill,
  onExpand,
  className = "",
  id,
}) {
  return (
    <section className={`panel ${className}`} id={id} aria-label={title}>
      <header className="panel-header">
        <h2>{title}</h2>
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
      {crumbs && <Breadcrumbs items={crumbs} onSelect={onDrill} />}
      {children}
    </section>
  );
}
