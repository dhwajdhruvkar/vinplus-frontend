import { useEffect, useState } from 'react'
import { normalizeMom, normalizeTrend, normalizeValues } from '../api/workflowAdapters.js'
import { postWorkflow, toWorkflowVariables } from '../api/workflowClient.js'
import { WORKFLOW_IDS } from '../api/workflowConfig.js'

const WORKFLOWS = [['values', normalizeValues], ['mom', normalizeMom], ['trend', normalizeTrend]]
const slot = (status) => ({ status, data: null, error: null })

export function useWorkflowData(filters, enabled) {
  const [settled, setSettled] = useState({})
  const key = JSON.stringify(toWorkflowVariables(filters))

  useEffect(() => {
    if (!enabled) return
    const variables = JSON.parse(key)
    const controllers = WORKFLOWS.map(() => new AbortController())
    const settle = (name, result) => setSettled((current) => ({ ...current, [name]: result }))

    WORKFLOWS.forEach(([name, normalize], i) => {
      const { signal } = controllers[i]
      postWorkflow(WORKFLOW_IDS[name], variables, signal)
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
