import { useEffect, useState } from 'react'
import {
  normalizeExpenseByDepartment, normalizeExpenseByJournal, normalizeMatrix, normalizeMom, normalizeMonthlyTrend, normalizeTrend, normalizeValues,
} from '../api/workflowAdapters.js'
import { postWorkflow, toWorkflowVariables } from '../api/workflowClient.js'
import { CHART_WORKFLOW_IDS, WORKFLOW_IDS } from '../api/workflowConfig.js'

// KPI workflows (values, mom, trend) and chart workflows (monthly, department, journal, matrix).
// `trend` is the KPI trend workflow and `monthly` is the separate Monthly Policy Expense Trend chart workflow; they are never merged.
// The chart workflows receive the same six-variable snapshot as the KPI workflows. Whether the chart workflows accept these variables is not confirmed by the backend.
const WORKFLOWS = [
  ['values', WORKFLOW_IDS.values, normalizeValues],
  ['mom', WORKFLOW_IDS.mom, normalizeMom],
  ['trend', WORKFLOW_IDS.trend, normalizeTrend],
  ['monthly', CHART_WORKFLOW_IDS.monthlyPolicyExpenseTrend, normalizeMonthlyTrend],
  ['department', CHART_WORKFLOW_IDS.expenseByDepartment, normalizeExpenseByDepartment],
  ['journal', CHART_WORKFLOW_IDS.expenseByJournal, normalizeExpenseByJournal],
  ['matrix', CHART_WORKFLOW_IDS.departmentMonthReviewMatrix, normalizeMatrix],
]
const slot = (status) => ({ status, data: null, error: null })

export function useWorkflowData(filters, enabled) {
  const [settled, setSettled] = useState({})
  const key = JSON.stringify(toWorkflowVariables(filters))

  useEffect(() => {
    if (!enabled) return
    const variables = JSON.parse(key)
    const controllers = WORKFLOWS.map(() => new AbortController())
    const settle = (name, result) => setSettled((current) => ({ ...current, [name]: result }))

    WORKFLOWS.forEach(([name, id, normalize], i) => {
      const { signal } = controllers[i]
      postWorkflow(id, variables, signal)
        .then(normalize)
        .then(
          (data) => !signal.aborted && settle(name, data.empty ? slot('empty') : { status: 'success', data, error: null }),
          (error) => !signal.aborted && settle(name, { status: 'error', data: null, error: error.message }),
        )
    })
    return () => {
      controllers.forEach((controller) => controller.abort())
      setSettled({})
    }
  }, [key, enabled])

  return Object.fromEntries(WORKFLOWS.map(([name]) => [name, enabled ? settled[name] ?? slot('loading') : slot('idle')]))
}
