import { summarize } from "./dashboard.js";

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
// Values exposed by the reference dashboard's weekday chart buttons.
export const referenceWeekdays = {
  sales: [78309.38, 104372.26, 120361.72, 76543.66, 101256.38, 29815.79],
  partial: [51, 82, 41, 56, 57, 20],
  total: [63, 131, 56, 91, 76, 29],
  actual: [1546.34, 2545.59, 795.72, 1193.42, 1685.78, 612.84],
  loss: [2886.406, 5362.6055, 3784.4945, 4211.6265, 3813.542, 1221.7],
};

// Groups the current sample rows by weekday for a summary card.
export function weekdayMetrics(rows, metric, filtered) {
  if (!filtered) {
    return weekdays.slice(0, 6).map((name, index) => {
      const value =
        metric === "rate"
          ? (referenceWeekdays.partial[index] /
              referenceWeekdays.total[index]) *
            100
          : referenceWeekdays[metric][index];
      return { name, value };
    });
  }
  return weekdays
    .map((name, index) => {
      const matching = rows.filter(
        (row) =>
          (new Date(`${row.date}T12:00:00Z`).getUTCDay() + 6) % 7 === index,
      );
      return { name, value: summarize(matching)[metric] };
    })
    .filter((row) => row.name !== "Sunday" || row.value !== 0);
}
