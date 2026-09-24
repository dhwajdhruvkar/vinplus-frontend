import React, { useEffect, useMemo, useRef, useState } from "react";
import Icon from "./components/Icon.jsx";
import {
  colors,
  VerticalChart,
  HorizontalChart,
  DonutChart,
  TrendChart,
} from "./components/Charts.jsx";
import {
  IconButton,
  Panel,
  KpiCards,
  FilterDrawer,
  RecordsTable,
  Modal,
} from "./components/DashboardUI.jsx";
import {
  defaultFilters,
  records,
  managers,
  advisors,
  vins,
  referenceSummary,
  referenceManager,
  referenceAdvisor,
  filterRecords,
  isFiltered,
  summarize,
  groupRecords,
  money,
  compactMoney,
  dateLabel,
  toCSV,
  dailyMetrics,
} from "./data/dashboard.js";

const PREF_KEY = "shop-supplies-view-v1";
function readPreference() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREF_KEY));
    if (!saved || typeof saved !== "object") return null;
    return Object.fromEntries(
      Object.keys(defaultFilters).map((key) => [
        key,
        typeof saved[key] === "string" ? saved[key] : defaultFilters[key],
      ]),
    );
  } catch {
    return null;
  }
}
function Logo() {
  return (
    <div className="logo" aria-label="Lumenore">
      <svg width="18" height="25" viewBox="0 0 18 25" aria-hidden="true">
        <path d="M2 2h6v17h10v5H2z" fill="#88baca" />
        <path d="M2 2h6v17H2z" fill="#b4bcd9" />
      </svg>
      <span>UMENORE</span>
      <sup>AI</sup>
    </div>
  );
}

export default function App() {
  const [filters, setFilters] = useState({ ...defaultFilters }),
    [drawer, setDrawer] = useState(false),
    [modal, setModal] = useState(null),
    [menu, setMenu] = useState(""),
    [comfortable, setComfortable] = useState(false),
    [edit, setEdit] = useState(false),
    [toast, setToast] = useState(""),
    [saved, setSaved] = useState(() => !!readPreference()),
    [home, setHome] = useState(false),
    [hidden, setHidden] = useState([]);
  const scrollRef = useRef(null),
    toastTimer = useRef(null);
  const notify = (message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    if (!menu) return;
    const close = (e) => {
      if (!e.target.closest(".menu-anchor")) setMenu("");
    };
    const esc = (e) => {
      if (e.key === "Escape") setMenu("");
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    };
  }, [menu]);
  const rows = useMemo(() => filterRecords(records, filters), [filters]);
  const filtered = isFiltered(filters),
    summary = filtered ? summarize(rows) : referenceSummary;
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const reset = () => {
    setFilters({ ...defaultFilters });
    setHidden([]);
    notify("Dashboard reset to the default selection.");
  };
  const detail = (title, field, value) =>
    setModal({ type: "records", title, field, value });
  const exportCSV = () => {
    const blob = new Blob(["\ufeff" + toCSV(rows)], {
        type: "text/csv;charset=utf-8;",
      }),
      url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shop-supplies-repair-orders.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMenu("");
    notify(`${rows.length} repair orders exported.`);
  };
  const dealerData = filtered
    ? groupRecords(rows, "dealer").map((r) => ({
        ...r,
        expected: r.total,
        actual: r.partial,
      }))
    : [
        { name: "6385", expected: 440, actual: 303 },
        { name: "SHELTON", expected: 1, actual: 1 },
      ];
  const dealerLoss = filtered
    ? groupRecords(rows, "dealer")
    : [
        { name: "6385", loss: 21200 },
        { name: "SHELTON", loss: 20 },
      ];
  const managerData = filtered
    ? groupRecords(rows, "manager")
    : referenceManager;
  const advisorData = filtered
    ? groupRecords(rows, "advisor")
    : referenceAdvisor;
  const vinRecords = filtered
    ? groupRecords(rows, "vin").map((r) => ({
        ...r,
        expected: r.total,
        actual: r.partial,
      }))
    : vins.slice(0, 6).map((name, i) => ({
        name,
        expected: i === 0 ? 2 : 1,
        actual: [1, 1, 0, 1, 0, 1][i],
      }));
  const vinLoss = filtered
    ? groupRecords(rows, "vin")
    : vins
        .slice(0, 6)
        .map((name, i) => ({ name, loss: [119, 107.23, 0, 61.75, 0, 119][i] }));
  const recurring = filtered
    ? groupRecords(rows, "vin").map((r) => ({ ...r, count: r.total }))
    : [
        { name: vins[1], expected: 107.23, count: 2 },
        { name: vins[3], expected: 61.75, count: 1 },
        { name: vins[5], expected: 119, count: 1 },
        { name: vins[6], expected: 48.55, count: 1 },
        { name: vins[7], expected: 119, count: 1 },
      ];
  const scaleMax = (data, key, min) =>
    Math.max(min, ...data.map((r) => r[key] || 0)) * 1.12;
  const openChart = (title, chart) => setModal({ type: "chart", title, chart });
  const chartPanel = (key, props, children) =>
    hidden.includes(key) ? null : (
      <div className={`panel-slot ${edit ? "editing" : ""}`} key={key}>
        {edit && (
          <button
            className="hide-panel"
            onClick={() => setHidden((h) => [...h, key])}
          >
            Hide chart
          </button>
        )}
        <Panel {...props} onExpand={() => openChart(props.title, children)}>
          {children}
        </Panel>
      </div>
    );
  const modalRows = modal?.field
    ? rows.filter((r) => r[modal.field] === modal.value)
    : rows;

  return (
    <div className={`app ${comfortable ? "comfortable-view" : ""}`}>
      <header className="app-header">
        <button
          className="logo-button"
          onClick={() => setHome(true)}
          aria-label="Lumenore home"
        >
          <Logo />
        </button>
        <div className="global-search">
          <Icon name="search" size={15} />
          <input
            placeholder="Search"
            aria-label="Search repair orders"
            value={filters.query}
            onChange={(e) => {
              update("query", e.target.value);
              setHome(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                document
                  .getElementById("ro-details")
                  ?.scrollIntoView({ behavior: "smooth" });
            }}
          />
          {filters.query && (
            <IconButton
              icon="close"
              label="Clear search"
              onClick={() => update("query", "")}
            />
          )}
        </div>
        <div className="header-tools">
          <button
            className="plan-button"
            onClick={() => setModal({ type: "about", title: "Plan details" })}
          >
            Plan details
          </button>
          <IconButton
            icon="rocket"
            label="Quick start"
            onClick={() =>
              setModal({ type: "guide", title: "Explore your dashboard" })
            }
          />
          <IconButton
            icon="help"
            label="Help"
            onClick={() => setModal({ type: "guide", title: "Dashboard help" })}
          />
          <IconButton
            icon="chat"
            label="Support"
            onClick={() => setModal({ type: "guide", title: "Dashboard help" })}
          />
          <IconButton
            icon="chat"
            label="Messages"
            onClick={() =>
              setModal({ type: "notification", title: "Messages" })
            }
          />
          <IconButton
            icon="bell"
            label="Notifications"
            onClick={() =>
              setModal({ type: "notification", title: "Notifications" })
            }
          />
          <button
            className="avatar"
            aria-label="My profile"
            onClick={() => setModal({ type: "profile", title: "My profile" })}
          >
            <Icon name="user" size={19} />
            <span>
              <Icon name="chevron" size={9} />
            </span>
          </button>
        </div>
      </header>
      <nav className="sidebar" aria-label="Main navigation">
        {[
          ["home", "Home"],
          ["data", "Data"],
          ["grid", "Dashboard"],
          ["bulb", "Do You Know"],
          ["magnet", "Data Magnet"],
          ["settings", "Manage"],
        ].map(([icon, label]) => (
          <button
            key={label}
            className={
              (label === "Dashboard" && !home) || (label === "Home" && home)
                ? "active"
                : ""
            }
            onClick={() => {
              if (label === "Home") setHome(true);
              else if (label === "Dashboard") {
                setHome(false);
                scrollRef.current?.scrollTo({ top: 0 });
              } else if (label === "Data")
                setModal({ type: "records", title: "Repair order data" });
              else if (label === "Do You Know")
                setModal({ type: "insights", title: "Do You Know" });
              else if (label === "Manage") {
                setDrawer(true);
              } else setModal({ type: "source", title: "Data Magnet" });
            }}
          >
            <span>
              <Icon name={icon} size={18} />
            </span>
            <small>{label}</small>
          </button>
        ))}
      </nav>
      <main className="workspace">
        <div className="tab-bar">
          <button
            className={home ? "tab selected" : "tab"}
            onClick={() => setHome(true)}
          >
            <Icon name="home" size={14} />
            Home
          </button>
          <button
            className={!home ? "tab selected" : "tab"}
            onClick={() => setHome(false)}
          >
            <span className="tab-play">
              <Icon name="play" size={12} />
            </span>
            Shop Supplies Analysiss{" "}
            <span
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                setHome(true);
              }}
            >
              ×
            </span>
          </button>
          <span className="tab-filler" />
          <IconButton
            icon="chevron"
            label="Open dashboards"
            onClick={() => setHome((h) => !h)}
          />
        </div>
        {home ? (
          <div className="home-content">
            <h1>Home</h1>
            <p>Your dashboards</p>
            <button className="dashboard-tile" onClick={() => setHome(false)}>
              <Icon name="grid" size={30} />
              <strong>Shop Supplies Analysiss</strong>
              <span>Service sales and shop supplies recovery</span>
              <span>Open dashboard →</span>
            </button>
          </div>
        ) : (
          <>
            <div className="dashboard-toolbar">
              <div className="dashboard-title">
                <h1>Shop Supplies Analysiss</h1>
                <IconButton
                  icon="info"
                  label="About this dashboard"
                  onClick={() =>
                    setModal({
                      type: "about",
                      title: "Shop Supplies Analysiss",
                    })
                  }
                />
              </div>
              <div className="toolbar-actions">
                <button
                  className={`toolbar-button edit-button ${edit ? "selected" : ""}`}
                  onClick={() => {
                    setEdit(!edit);
                    if (edit) notify("Dashboard layout updated.");
                  }}
                >
                  <Icon name={edit ? "check" : "edit"} size={14} />
                  {edit ? "Done" : "Edit"}
                </button>
                <button
                  className="toolbar-button"
                  onClick={() =>
                    setModal({ type: "insights", title: "Dashboard insights" })
                  }
                >
                  <Icon name="insight" />
                  Insights
                </button>
                <button
                  className="toolbar-button"
                  onClick={() => setDrawer(true)}
                >
                  <Icon name="filter" size={14} />
                  Filters
                </button>
                <button className="toolbar-button" onClick={reset}>
                  <Icon name="refresh" size={14} />
                  Reset
                </button>
                <div className="menu-anchor">
                  <button
                    className="toolbar-button"
                    aria-expanded={menu === "view"}
                    onClick={() => setMenu(menu === "view" ? "" : "view")}
                  >
                    <Icon name="pin" size={14} />
                    View preference
                  </button>
                  {menu === "view" && (
                    <div className="dropdown-menu">
                      <label>
                        <input
                          type="checkbox"
                          checked={comfortable}
                          onChange={(e) => setComfortable(e.target.checked)}
                        />
                        Larger summary cards
                      </label>
                      <button
                        onClick={() => {
                          setHidden([]);
                          setMenu("");
                        }}
                      >
                        Show all charts
                      </button>
                      <button
                        disabled={!saved}
                        onClick={() => {
                          const pref = readPreference();
                          if (pref) setFilters(pref);
                          setMenu("");
                        }}
                      >
                        Load saved filters
                      </button>
                    </div>
                  )}
                </div>
                <div className="menu-anchor">
                  <button
                    className="toolbar-button"
                    aria-expanded={menu === "more"}
                    onClick={() => setMenu(menu === "more" ? "" : "more")}
                  >
                    <Icon name="dots" size={14} />
                    More Options
                  </button>
                  {menu === "more" && (
                    <div className="dropdown-menu">
                      <button onClick={exportCSV}>
                        <Icon name="download" />
                        Export repair orders (CSV)
                      </button>
                      <button
                        onClick={() => {
                          scrollRef.current?.scrollTo({
                            top: scrollRef.current.scrollHeight,
                            behavior: "smooth",
                          });
                          setMenu("");
                        }}
                      >
                        View RO Details
                      </button>
                      <button
                        onClick={() => {
                          setModal({ type: "guide", title: "Dashboard help" });
                          setMenu("");
                        }}
                      >
                        Dashboard help
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className="analyst-button"
                  onClick={() =>
                    setModal({ type: "insights", title: "Dashboard Analyst" })
                  }
                >
                  <Icon name="sparkle" />
                  Dashboard Analyst
                </button>
              </div>
            </div>
            <div className="dashboard-scroll" ref={scrollRef}>
              <section className="selection-bar" aria-label="Current selection">
                <div className="selection-label">
                  Current selection
                  <IconButton
                    icon="filter"
                    label="Edit current selection"
                    onClick={() => setDrawer(true)}
                  />
                </div>
                {[
                  ["Closed Date From", filters.from],
                  ["Closed Date To", filters.to],
                ].map(([label, value]) => (
                  <button
                    className="selection-chip date-chip"
                    key={label}
                    onClick={() => setDrawer(true)}
                  >
                    <Icon name="calendar" size={13} />
                    <span>
                      {label}
                      <strong>{dateLabel(value)}</strong>
                    </span>
                  </button>
                ))}
                {[
                  ["manager", "Manager"],
                  ["advisor", "Service Advisor"],
                  ["status", "Status"],
                  ["vin", "VIN Number"],
                  ["ro", "Repair Order No"],
                  ["query", "Search"],
                ]
                  .filter(([key]) => filters[key])
                  .map(([key, label]) => (
                    <button
                      className="selection-chip extra-chip"
                      key={key}
                      onClick={() => update(key, "")}
                      title={`Clear ${label}`}
                    >
                      <span>
                        {label}
                        <strong>{filters[key]}</strong>
                      </span>
                      <Icon name="close" size={12} />
                    </button>
                  ))}
              </section>
              <KpiCards
                summary={summary}
                comfortable={comfortable}
                onDrill={(title) => setModal({ type: "daily", title })}
              />
              <div className="dashboard-grid">
                <div className="three-column dealer-row">
                  {chartPanel(
                    "dealer",
                    {
                      title: "Partial Recovery Repair Orders by Dealer",
                      id: "dealer-orders",
                    },
                    <VerticalChart
                      data={dealerData}
                      max={filtered ? scaleMax(dealerData, "expected", 1) : 600}
                      onSelect={(name) =>
                        detail(`${name} · Repair Orders`, "dealer", name)
                      }
                    />,
                  )}
                  {chartPanel(
                    "dealerLoss",
                    {
                      title: "Unrecovered Shop Supplies by Dealer",
                      crumbs: ["Unrecovered SS", "Detail"],
                      onDrill: () =>
                        detail("Unrecovered Shop Supplies by Dealer"),
                    },
                    <HorizontalChart
                      data={dealerLoss}
                      height={190}
                      labelWidth={82}
                      max={filtered ? scaleMax(dealerLoss, "loss", 1) : 25000}
                      onSelect={(name) =>
                        detail(
                          `${name} · Unrecovered Shop Supplies`,
                          "dealer",
                          name,
                        )
                      }
                    />,
                  )}
                  {chartPanel(
                    "breakdown",
                    {
                      title:
                        "Unrecovered Shop Supplies Sales Metrics Breakdown",
                    },
                    filtered ? (
                      <VerticalChart
                        data={[
                          {
                            name: "Selected repair orders",
                            expected: summary.expected,
                            actual: summary.actual,
                          },
                        ]}
                        currency
                        max={Math.max(1, summary.expected * 1.25)}
                        onSelect={() => detail("Selected repair orders")}
                      />
                    ) : (
                      <DonutChart
                        onSelect={(name) => detail(`${name} · RO Details`)}
                      />
                    ),
                  )}
                </div>
                {chartPanel(
                  "manager",
                  {
                    title: "Manager Performance Analysis",
                    className: "manager-panel",
                    crumbs: [
                      "Manager Name",
                      "Manager Details",
                      "Status Detail",
                    ],
                    onDrill: () => detail("Manager Performance Analysis"),
                  },
                  <VerticalChart
                    data={managerData}
                    currency
                    line
                    max={filtered ? scaleMax(managerData, "expected", 1) : 7500}
                    height={247}
                    onSelect={(name) =>
                      detail(`${name} · Manager Details`, "manager", name)
                    }
                  />,
                )}
                <div className="two-column advisor-row">
                  {chartPanel(
                    "advisor",
                    {
                      title: "Service Advisor Performance",
                      crumbs: ["Service Advisor", "RO Details"],
                      onDrill: () => detail("Service Advisor · RO Details"),
                    },
                    <div className="advisor-chart-scroll">
                      <HorizontalChart
                        data={advisorData}
                        height={Math.max(292, advisorData.length * 49)}
                        labelWidth={116}
                        max={filtered ? scaleMax(advisorData, "loss", 1) : 5400}
                        ticks={9}
                        scroll
                        series={[
                          {
                            key: "count",
                            color: colors.yellow,
                            scale: filtered ? 10 : 60,
                            label: "Repair orders",
                          },
                          {
                            key: "loss",
                            color: colors.red,
                            currency: true,
                            label: "Unrecovered shop supplies",
                          },
                        ]}
                        onSelect={(name) =>
                          detail(`${name} · RO Details`, "advisor", name)
                        }
                      />
                    </div>,
                  )}
                  <div className="advisor-right">
                    <div className="select-panel">
                      <label htmlFor="advisor-select">Service Advisor</label>
                      <select
                        id="advisor-select"
                        value={filters.advisor}
                        onChange={(e) => update("advisor", e.target.value)}
                      >
                        <option value="">Select data</option>
                        {advisors.map((name) => (
                          <option key={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                    {chartPanel(
                      "trend",
                      {
                        title: "Monthly Unrecovered Shop Supplies Trend",
                        crumbs: ["Monthly", "RO Details"],
                        onDrill: () => detail("Monthly · RO Details"),
                      },
                      <TrendChart
                        value={summary.loss}
                        onSelect={() => detail("February 2024 · RO Details")}
                      />,
                    )}
                  </div>
                </div>
                <div className="three-column vin-row">
                  {chartPanel(
                    "vinOrders",
                    { title: "Partial Recovery Repair Orders by VIN" },
                    <HorizontalChart
                      data={vinRecords}
                      max={filtered ? scaleMax(vinRecords, "expected", 1) : 2.5}
                      height={241}
                      scroll
                      series={[
                        {
                          key: "expected",
                          color: colors.green,
                          label: "Total records",
                        },
                        {
                          key: "actual",
                          color: colors.red,
                          label: "Partial recovery",
                        },
                      ]}
                      onSelect={(name) =>
                        detail("VIN · RO Details", "vin", name)
                      }
                    />,
                  )}
                  {chartPanel(
                    "vinLoss",
                    {
                      title: "Unrecovered Shop Supplies by VIN",
                      crumbs: ["Unrecovered S S", "Details"],
                      onDrill: () => detail("Unrecovered Shop Supplies by VIN"),
                    },
                    <HorizontalChart
                      insideLabels
                      data={vinLoss}
                      max={filtered ? scaleMax(vinLoss, "loss", 1) : 125}
                      height={207}
                      scroll
                      onSelect={(name) =>
                        detail("VIN · Unrecovered Shop Supplies", "vin", name)
                      }
                    />,
                  )}
                  {chartPanel(
                    "recurring",
                    {
                      title: "Recurring Shop Supplies Shortfall by Vehicle",
                      crumbs: ["VIN", "Detail"],
                      onDrill: () =>
                        detail("Recurring Shop Supplies Shortfall by Vehicle"),
                    },
                    <HorizontalChart
                      data={recurring}
                      max={filtered ? scaleMax(recurring, "expected", 1) : 150}
                      height={207}
                      scroll
                      series={[
                        {
                          key: "expected",
                          color: colors.green,
                          currency: true,
                          label: "Expected supplies",
                        },
                        {
                          key: "count",
                          color: colors.yellow,
                          scale: 60,
                          label: "Recurring exceptions",
                        },
                      ]}
                      onSelect={(name) =>
                        detail("Recurring Vehicle · Details", "vin", name)
                      }
                    />,
                  )}
                </div>
                <div className="detail-row" id="ro-details">
                  <div className="detail-filters">
                    <div className="select-panel">
                      <div className="filter-label">
                        <label htmlFor="ro-select">Repair Order No</label>
                        <IconButton
                          icon="refresh"
                          label="Reset repair order"
                          onClick={() => update("ro", "")}
                        />
                      </div>
                      <select
                        id="ro-select"
                        value={filters.ro}
                        onChange={(e) => update("ro", e.target.value)}
                      >
                        <option value="">Select data</option>
                        {records.map((r) => (
                          <option key={r.ro}>{r.ro}</option>
                        ))}
                      </select>
                    </div>
                    <div className="select-panel status-panel">
                      <div className="filter-label">
                        <label>Status</label>
                        <IconButton
                          icon="refresh"
                          label="Reset status"
                          onClick={() => update("status", "")}
                        />
                      </div>
                      {[
                        "Select all",
                        "Fully Recovered",
                        "Partially Recovered",
                      ].map((status) => (
                        <label className="checkbox-label" key={status}>
                          <input
                            type="checkbox"
                            checked={
                              status === "Select all"
                                ? !filters.status
                                : filters.status === status
                            }
                            onChange={(e) =>
                              update(
                                "status",
                                status === "Select all"
                                  ? ""
                                  : e.target.checked
                                    ? status
                                    : "",
                              )
                            }
                          />
                          {status}
                        </label>
                      ))}
                    </div>
                  </div>
                  <Panel title="RO Details" className="records-panel">
                    <RecordsTable
                      rows={rows}
                      onRowClick={(r) =>
                        setModal({
                          type: "record",
                          title: `Repair Order ${r.ro}`,
                          record: r,
                        })
                      }
                    />
                  </Panel>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      {drawer && (
        <FilterDrawer
          filters={filters}
          saved={saved}
          onClose={() => setDrawer(false)}
          onApply={(draft) => {
            setFilters(draft);
            setDrawer(false);
          }}
          onSave={(draft) => {
            try {
              localStorage.setItem(PREF_KEY, JSON.stringify(draft));
              setSaved(true);
              notify("Filter preference saved.");
            } catch {
              notify("This browser could not save the preference.");
            }
          }}
          onLoad={readPreference}
        />
      )}
      {modal && (
        <Modal
          title={modal.title}
          onClose={() => setModal(null)}
          wide={["records", "chart"].includes(modal.type)}
        >
          {modal.type === "records" && (
            <>
              <div className="modal-summary">
                <span>{modalRows.length} repair orders</span>
                <strong>Unrecovered: {money(summarize(modalRows).loss)}</strong>
              </div>
              <RecordsTable
                rows={modalRows}
                compact
                onRowClick={(r) =>
                  setModal({
                    type: "record",
                    title: `Repair Order ${r.ro}`,
                    record: r,
                  })
                }
              />
            </>
          )}
          {modal.type === "chart" && (
            <div className="expanded-chart">{modal.chart}</div>
          )}
          {modal.type === "daily" && (
            <>
              <p className="muted">
                {dateLabel(filters.from)} – {dateLabel(filters.to)} · Available
                repair orders
              </p>
              <HorizontalChart
                data={dailyMetrics(rows, modal.title)}
                series={[
                  {
                    key: "metric",
                    label: modal.title,
                    color: colors.red,
                    currency:
                      !modal.title.includes("%") &&
                      modal.title !== "Shop Supplies Partial Recovery",
                  },
                ]}
                max={
                  Math.max(
                    1,
                    ...dailyMetrics(rows, modal.title).map((r) => r.metric),
                  ) * 1.2
                }
                height={380}
                onSelect={(name) =>
                  detail(`${dateLabel(name)} · RO Details`, "date", name)
                }
              />
            </>
          )}
          {modal.type === "record" && (
            <dl className="record-details">
              {[
                ["RO Number", modal.record.ro],
                ["Dealer Code", modal.record.dealer || "—"],
                ["Make / Model", `${modal.record.make} ${modal.record.model}`],
                ["VIN", modal.record.vin],
                ["Manager", modal.record.manager],
                ["Service Advisor", modal.record.advisor],
                ["Closed Date", dateLabel(modal.record.date)],
                ["Expected Shop Supplies", money(modal.record.expected)],
                ["Actual Shop Supplies", money(modal.record.actual)],
                ["Unrecovered Shop Supplies", money(modal.record.loss)],
                ["Status", modal.record.status],
              ].map(([label, value]) => (
                <React.Fragment key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}
          {modal.type === "insights" && (
            <div className="insights">
              <div className="insight-heading">
                <Icon name="sparkle" size={28} />
                <h3>Shop supplies at a glance</h3>
              </div>
              <p>
                <strong>
                  {summary.partial} of {summary.total}
                </strong>{" "}
                repair orders require review, representing{" "}
                <strong>{summary.rate.toFixed(2)}%</strong> of the current
                selection.
              </p>
              <p>
                Actual shop supplies recovery is{" "}
                <strong>{compactMoney(summary.actual)}</strong> against{" "}
                <strong>{compactMoney(summary.expected)}</strong> expected.
              </p>
              <div className="insight-total">
                <span>Unrecovered shop supplies</span>
                <strong>{money(summary.loss)}</strong>
              </div>
              <button
                className="primary-button"
                onClick={() => {
                  setModal(null);
                  document
                    .getElementById("ro-details")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Review repair orders
              </button>
            </div>
          )}
          {modal.type === "about" && (
            <div className="about-content">
              <Logo />
              <h3>Shop Supplies Analysiss</h3>
              <p>
                Service sales, recovery performance, and shop supplies
                shortfalls across dealers, managers, service advisors, and
                vehicles.
              </p>
              <p className="muted">
                Current period: {dateLabel(filters.from)} –{" "}
                {dateLabel(filters.to)}
              </p>
            </div>
          )}
          {modal.type === "guide" && (
            <div className="help-content">
              <p>
                Use <strong>Filters</strong> to choose a date range, manager,
                service advisor, VIN, or recovery status.
              </p>
              <p>
                Select a bar or a chart breadcrumb to review the matching repair
                orders. Click a table heading to sort, or an RO number to see
                its details.
              </p>
              <p>
                <strong>More Options</strong> lets you export the current repair
                orders. Save filter preferences to return to the same selection
                later.
              </p>
              <button
                className="primary-button"
                onClick={() => {
                  setModal(null);
                  setDrawer(true);
                }}
              >
                Open filters
              </button>
            </div>
          )}
          {modal.type === "notification" && (
            <div className="empty-state">
              <Icon name="bell" size={30} />
              <p>You’re all caught up.</p>
            </div>
          )}
          {modal.type === "profile" && (
            <div className="profile-content">
              <span className="profile-icon">
                <Icon name="user" size={35} />
              </span>
              <h3>Dashboard viewer</h3>
              <p>Shop Supplies Analysiss</p>
              <button
                className="text-button"
                onClick={() => {
                  setModal(null);
                  setDrawer(true);
                }}
              >
                Manage view preferences
              </button>
            </div>
          )}
          {modal.type === "source" && (
            <div className="source-content">
              <Icon name="data" size={32} />
              <h3>Shop Supplies</h3>
              <p>{records.length} available repair orders</p>
              <button
                className="primary-button"
                onClick={() =>
                  setModal({ type: "records", title: "Repair order data" })
                }
              >
                View data
              </button>
            </div>
          )}
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
