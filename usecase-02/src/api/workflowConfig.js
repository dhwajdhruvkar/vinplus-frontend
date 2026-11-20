const env = import.meta.env ?? {}

export const WORKFLOW_IDS = {
  values: '219b13e1-e278-11f1-90ac-bbceffb96a86',
  mom: '42b611b4-e282-11f1-bb3e-2b181ae5ba27',
  trend: '91105879-e27e-11f1-90ac-6190e2b6d09a',
}
// Filter-option workflows. Registered only: no response sample exists yet, so nothing calls them.
export const FILTER_WORKFLOW_IDS = {
  date: '62918141-e3d8-11f1-9762-a5af176bbe5f',
  brand: '2061a1bb-e403-11f1-9762-dde4e7ef0ade',
  department: '5acbdaee-e403-11f1-a77e-f5de89fb1959',
  journal: '849b9706-e403-11f1-bb3e-d3f9dbfde49a',
  reviewStatus: 'ca75d2cc-e403-11f1-9762-afebec02bed8',
}

// Chart workflows. Registered only: no response sample exists yet, so nothing calls them.
// monthlyPolicyExpenseTrend is a different workflow from WORKFLOW_IDS.trend, which feeds the KPI trend.
export const CHART_WORKFLOW_IDS = {
  monthlyPolicyExpenseTrend: '34193547-e289-11f1-bb3e-09f97608afe2',
  expenseByDepartment: 'bf89a2cf-e316-11f1-bc8d-8f751d6bb36e',
  expenseByJournal: '102810d7-e317-11f1-a77e-e5d170f381f7',
  departmentMonthReviewMatrix: 'fe8e5d08-e31f-11f1-9762-0d3e12db583a',
}

export const APP_ID = '36b2f3dd-e259-11f1-bb3e-25ec636cd1f0'

export const DATA_MODE = env.VITE_DATA_MODE === 'live' ? 'live' : 'demo'
const LUMENORE_WORKFLOW_URL = 'https://apphub.lumenore.com/appsapi/appbuilder/workflow/'
// In local development requests go through the Vite dev-server proxy (see vite.config.js); builds call the endpoint directly.
export const DEV_PROXY_PATH = '/lumenore-workflow/'
export const BASE_URL = env.VITE_WORKFLOW_BASE_URL || (env.DEV ? DEV_PROXY_PATH : LUMENORE_WORKFLOW_URL)
export const CREDENTIALS = env.VITE_WORKFLOW_CREDENTIALS === 'include' ? 'include' : 'omit'

// Captured from a browser session, not confirmed by the backend team. Further headers
// (accept, device-details, geo-location, time-zone, x-lumenore-studio) are added only after confirmation.
export const WORKFLOW_HEADERS = { 'application-id': APP_ID }
