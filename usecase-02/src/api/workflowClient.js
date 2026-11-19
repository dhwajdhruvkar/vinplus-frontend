import { APP_ID, BASE_URL, CREDENTIALS, WORKFLOW_HEADERS } from './workflowConfig.js'

export class WorkflowError extends Error {}

// UI filter key -> workflow variable name. Selections are passed through exactly as shown in the UI.
const VARIABLE_BY_FILTER = { brand: 'Brand', dept: 'Department', journal: 'Journal', status: 'Review_Status' }
const DATE_VARIABLE_BY_FILTER = { dateStart: 'Min_Date', dateEnd: 'Max_Date' }

// 'YYYY-MM-DD' -> 'DD-MM-YYYY' by string handling only, so time zones cannot shift the day.
export const toWorkflowDate = (isoDate) => {
  const [year, month, day] = String(isoDate || '').split('-')
  return year && month && day ? `${day}-${month}-${year}` : ''
}

export const toWorkflowVariables = (filters) => ({
  ...Object.fromEntries(Object.entries(VARIABLE_BY_FILTER).map(([key, name]) => [name, filters[key] === 'all' ? '' : filters[key]])),
  ...Object.fromEntries(Object.entries(DATE_VARIABLE_BY_FILTER).map(([key, name]) => [name, toWorkflowDate(filters[key])])),
})

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
  if (import.meta.env?.DEV && json && typeof json === 'object') console.debug('[workflow] response keys', Object.keys(json))
  return json
}
