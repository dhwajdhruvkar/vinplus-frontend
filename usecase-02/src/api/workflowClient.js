import { APP_ID, BASE_URL, CREDENTIALS, WORKFLOW_HEADERS } from './workflowConfig.js'

export class WorkflowError extends Error {}

// UI filter key -> workflow variable name. Spellings of values are passed through exactly as shown in the UI.
const VARIABLE_BY_FILTER = { brand: 'Brand', dept: 'Department', journal: 'Journal', status: 'Review_Status' }

export const toWorkflowVariables = (filters) =>
  Object.fromEntries(Object.entries(VARIABLE_BY_FILTER).map(([key, name]) => [name, filters[key] === 'all' ? '' : filters[key]]))

export async function postWorkflow(workflowId, variables, signal) {
  const body = new FormData()
  body.append('data', JSON.stringify({ variable: variables, data: { appId: APP_ID } }))

  let response
  try {
    response = await fetch(BASE_URL + workflowId, { method: 'POST', body, headers: WORKFLOW_HEADERS, credentials: CREDENTIALS, signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new WorkflowError('Network or cross-origin (CORS) request blocked')
  }
  if (response.status === 401 || response.status === 403) throw new WorkflowError('Not authorised — live API access is not configured')
  if (!response.ok) throw new WorkflowError(`Service error (HTTP ${response.status})`)

  let json
  try {
    json = await response.json()
  } catch {
    throw new WorkflowError('Unexpected response format')
  }
  if (import.meta.env.DEV && json && typeof json === 'object') console.debug('[workflow] response keys', Object.keys(json))
  return json
}
