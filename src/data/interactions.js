// Keeps chart selections separate from the filters in the drawer.
export const initialInteractions = { selections: [], levels: {}, revision: 0 };

// Updates a drill level and keeps independent chart selections intact.
export function interactionReducer(state, action) {
  if (action.type === "reset") {
    return { ...initialInteractions, revision: state.revision + 1 };
  }
  if (action.type === "select") {
    const choice = action.selection;
    return {
      ...state,
      selections: [
        ...state.selections.filter(
          (item) => item.owner !== choice.owner || item.depth < choice.depth,
        ),
        choice,
      ],
      levels:
        action.level === undefined
          ? state.levels
          : {
              ...state.levels,
              [choice.owner]: action.level,
            },
    };
  }
  if (action.type === "remove") {
    const choice = state.selections.find((item) => item.id === action.id);
    if (!choice) return state;
    return clearFromDepth(state, choice.owner, choice.depth);
  }
  if (action.type === "up") {
    return clearFromDepth(state, action.owner, state.levels[action.owner] || 1);
  }
  if (action.type === "reset-panel") {
    return clearFromDepth(state, action.owner, 0);
  }
  return state;
}

// Removes a panel's current selection and any deeper selections it created.
function clearFromDepth(state, owner, depth) {
  return {
    ...state,
    selections: state.selections.filter(
      (item) => item.owner !== owner || item.depth < depth,
    ),
    levels: { ...state.levels, [owner]: Math.max(0, depth - 1) },
  };
}

// Intersects every chart selection, including two charts using the same field.
export function matchSelections(rows, selections) {
  return rows.filter((row) =>
    selections.every(({ field, value }) => {
      if (field === "month") return row.date.slice(0, 7) === value;
      return (row[field] || "(Blank)") === value;
    }),
  );
}

// The month chip alone does not change totals within the default month.
export function hasRecordSelection(selections) {
  return selections.some((item) => item.field !== "month");
}
