import { useEffect, useState } from 'react'
import {
  normalizeBrandOptions, normalizeDateBounds, normalizeDepartmentOptions, normalizeJournalOptions, normalizeReviewOptions,
} from '../api/workflowAdapters.js'
import { postWorkflow } from '../api/workflowClient.js'
import { FILTER_WORKFLOW_IDS } from '../api/workflowConfig.js'

const WORKFLOWS = [
  ['date', FILTER_WORKFLOW_IDS.date, normalizeDateBounds],
  ['brand', FILTER_WORKFLOW_IDS.brand, normalizeBrandOptions],
  ['department', FILTER_WORKFLOW_IDS.department, normalizeDepartmentOptions],
  ['journal', FILTER_WORKFLOW_IDS.journal, normalizeJournalOptions],
  ['reviewStatus', FILTER_WORKFLOW_IDS.reviewStatus, normalizeReviewOptions],
]
const slot = (status) => ({ status, data: null, error: null })

// Fetches the option lists once. The request contract for these workflows is unconfirmed, so they are sent with no filter
// variables: the lists do not cascade from the other selections and are not refetched when a filter changes.
export function useFilterOptions(enabled) {
  const [settled, setSettled] = useState({})

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    const { signal } = controller
    const settle = (name, result) => setSettled((current) => ({ ...current, [name]: result }))
    for (const [name, id, normalize] of WORKFLOWS) {
      postWorkflow(id, {}, signal)
        .then(normalize)
        .then(
          (data) => !signal.aborted && settle(name, data.empty ? slot('empty') : { status: 'success', data, error: null }),
          (error) => !signal.aborted && settle(name, { status: 'error', data: null, error: error.message }),
        )
    }
    return () => controller.abort()
  }, [enabled])

  return Object.fromEntries(WORKFLOWS.map(([name]) => [name, enabled ? settled[name] ?? slot('loading') : slot('idle')]))
}
