import React, { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { colors } from "./Charts.jsx";
import {
  compactMoney,
  money,
  tableColumns,
  defaultFilters,
  managers,
  advisors,
  vins,
} from "../data/dashboard.js";

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
export function KpiCards({ summary, onDrill, comfortable }) {
  const s = summary,
    cards = [
      {
        title: "Total Sales",
        sub: "Labor + Parts",
        value: compactMoney(s.sales),
        footer: "Expected Shop Supplies Recovery",
        bottom: compactMoney(s.expected),
        color: "green",
        icon: "data",
        tooltip: money(s.sales),
      },
      {
        title: "Shop Supplies Partial Recovery",
        sub: "Records Requiring Review",
        value: s.partial,
        denom: s.total,
        footer: "Shop Supplies Partial Recovery Amount",
        bottom: compactMoney(s.expected),
        color: "yellow",
        bar: true,
        icon: "filter",
        tooltip: `${s.partial} of ${s.total} records`,
      },
      {
        title: "Partial Recovery %",
        sub: "Share of all records",
        value: `${s.rate.toFixed(2)}%`,
        footer: "Compliance Rate",
        bottom: `${s.total ? (100 - s.rate).toFixed(2) : "0.00"}%`,
        color: "yellow",
        icon: "sparkle",
        tooltip: `${s.rate.toFixed(2)}%`,
      },
      {
        title: "Shop Supplies Recovery Status",
        sub: "Amount of Flagged Records",
        value: compactMoney(s.actual),
        denom: compactMoney(s.expected),
        footer: "Shop Supplies Recovery %",
        bottom: `${s.recovery.toFixed(2)}%`,
        color: "green",
        bar: true,
        icon: "pin",
        tooltip: money(s.actual),
      },
      {
        title: "Unrecovered Shop Supplies",
        sub: "Total Reported Loss",
        value: compactMoney(s.loss),
        footer: "Unrecovered %",
        bottom: `${s.expected ? (100 - s.recovery).toFixed(2) : "0.00"}%`,
        color: "red",
        icon: "data",
        tooltip: money(s.loss),
      },
    ];
  return (
    <section
      className={`kpi-region ${comfortable ? "comfortable" : ""}`}
      aria-label="Dashboard summary"
    >
      <div className="kpi-grid">
        {cards.map((c) => (
          <article className="kpi-card" key={c.title}>
            <h2>{c.title}</h2>
            <p className="kpi-subtitle">{c.sub}</p>
            <div className="kpi-value" title={c.tooltip}>
              {c.value}
              {c.denom !== undefined && <span> / {c.denom}</span>}
            </div>
            <button
              className={`kpi-mini-chart ${c.bar ? "bar" : "dot"}`}
              aria-label={`Show daily ${c.title}`}
              onClick={() => onDrill(c.title)}
              style={{ "--chart-color": colors[c.color] }}
            >
              <i />
              <span>Feb</span>
            </button>
            <div className={`kpi-footer ${c.color}`}>
              <span className="kpi-footer-icon">
                <Icon name={c.icon} size={8} />
              </span>
              <div>
                <strong>{c.footer}</strong>
                <span>{c.bottom}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function useModalClose(onClose) {
  const ref = useRef(null),
    closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const container = ref.current;
    const focusables = () => [
      ...container.querySelectorAll(
        'button:not(:disabled), input, select, [tabindex="0"]',
      ),
    ];
    focusables()[0]?.focus();
    const key = (e) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const elements = focusables(),
          first = elements[0],
          last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return ref;
}
export function FilterDrawer({
  filters,
  onClose,
  onApply,
  onSave,
  saved,
  onLoad,
}) {
  const [draft, setDraft] = useState(filters),
    [search, setSearch] = useState(""),
    [error, setError] = useState("");
  const ref = useModalClose(onClose);
  const change = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const apply = () => {
    if (draft.from && draft.to && draft.from > draft.to) {
      setError("Start date must be on or before end date.");
      return;
    }
    onApply(draft);
  };
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        className="filter-drawer"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
      >
        <header>
          <h2 id="filter-title">
            <Icon name="filter" />
            Filters
          </h2>
          <select
            aria-label="Set Preference"
            value=""
            onChange={() => {
              const value = onLoad();
              if (value) setDraft(value);
            }}
          >
            <option value="">Set Preference</option>
            <option value="saved" disabled={!saved}>
              Saved preference
            </option>
          </select>
          <IconButton icon="close" label="Close filters" onClick={onClose} />
        </header>
        <div className="filter-body">
          <div className="filter-search">
            <input
              placeholder="Search filter"
              aria-label="Search filter"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Icon name="search" size={13} />
          </div>
          {"Closed Date".toLowerCase().includes(search.toLowerCase()) && (
            <div className="filter-field">
              <label>Closed Date</label>
              <div className="date-range">
                <input
                  aria-label="Start date"
                  type="date"
                  value={draft.from}
                  onChange={(e) => change("from", e.target.value)}
                  onInput={(e) => change("from", e.currentTarget.value)}
                />
                <span>~</span>
                <input
                  aria-label="End date"
                  type="date"
                  value={draft.to}
                  onChange={(e) => change("to", e.target.value)}
                  onInput={(e) => change("to", e.currentTarget.value)}
                />
              </div>
            </div>
          )}
          {[
            ["manager", "Manager", managers],
            ["advisor", "Service Advisor", advisors],
            ["vin", "VIN Number", vins],
            ["status", "Status", ["Fully Recovered", "Partially Recovered"]],
          ]
            .filter(([, label]) =>
              label.toLowerCase().includes(search.toLowerCase()),
            )
            .map(([key, label, options]) => (
              <div className="filter-field" key={key}>
                <label htmlFor={`filter-${key}`}>{label}</label>
                <select
                  id={`filter-${key}`}
                  value={draft[key]}
                  onChange={(e) => change(key, e.target.value)}
                >
                  <option value="">All</option>
                  {options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            ))}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <footer>
          <button
            className="text-button"
            onClick={() => {
              setDraft({ ...defaultFilters });
              setError("");
            }}
          >
            Reset Filters
          </button>
          <button
            className="primary-button"
            onClick={() => {
              if (draft.from && draft.to && draft.from > draft.to) {
                setError("Start date must be on or before end date.");
                return;
              }
              onSave(draft);
            }}
          >
            Save Preferences
          </button>
          <button className="primary-button" onClick={apply}>
            Apply
          </button>
        </footer>
      </aside>
    </div>
  );
}

export function RecordsTable({ rows, onRowClick, compact = false }) {
  const [sort, setSort] = useState({ key: "", asc: true });
  const sorted = [...rows].sort((a, b) => {
    if (!sort.key) return 0;
    const val = (r) =>
      sort.key === "percent"
        ? r.expected
          ? r.loss / r.expected
          : 0
        : r[sort.key];
    const av = val(a),
      bv = val(b);
    return (
      (typeof av === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, { numeric: true })) *
      (sort.asc ? 1 : -1)
    );
  });
  return (
    <div className={`table-scroll ${compact ? "compact-table" : ""}`}>
      <table>
        <thead>
          <tr>
            {tableColumns.map(([key, label]) => (
              <th
                key={key}
                aria-sort={
                  sort.key === key
                    ? sort.asc
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button
                  onClick={() =>
                    setSort({ key, asc: sort.key === key ? !sort.asc : true })
                  }
                >
                  {label}
                  {sort.key === key && <span>{sort.asc ? " ↑" : " ↓"}</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.ro}>
              {tableColumns.map(([key]) => (
                <td
                  key={key}
                  className={`${key === "ro" ? "ro-number" : ""} ${["expected", "actual", "loss", "percent"].includes(key) ? "numeric" : ""}`}
                >
                  {key === "ro" ? (
                    <button onClick={() => onRowClick?.(r)}>{r.ro}</button>
                  ) : key === "percent" ? (
                    `${(r.percent ?? (r.expected ? (r.loss / r.expected) * 100 : 0)).toFixed(2)}%`
                  ) : ["expected", "actual", "loss"].includes(key) ? (
                    money(r[key]).replace("$", "$ ")
                  ) : (
                    r[key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <div className="empty-state">
          No repair orders match the current selection.
        </div>
      )}
    </div>
  );
}
export function Modal({ title, children, onClose, wide = false }) {
  const ref = useModalClose(onClose);
  return (
    <div
      className="modal-backdrop centered"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`modal ${wide ? "wide" : ""}`}
        ref={ref}
      >
        <header>
          <h2 id="modal-title">{title}</h2>
          <IconButton icon="close" label="Close dialog" onClick={onClose} />
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
