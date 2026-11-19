const env = import.meta.env

export const WORKFLOW_IDS = {
  values: '219b13e1-e278-11f1-90ac-bbceffb96a86',
  mom: '42b611b4-e282-11f1-bb3e-2b181ae5ba27',
  trend: '91105879-e27e-11f1-90ac-6190e2b6d09a',
}
export const APP_ID = '36b2f3dd-e259-11f1-bb3e-25ec636cd1f0'

export const DATA_MODE = env.VITE_DATA_MODE === 'live' ? 'live' : 'demo'
export const BASE_URL = env.VITE_WORKFLOW_BASE_URL || 'https://apphub.lumenore.com/appsapi/appbuilder/workflow/'
export const CREDENTIALS = env.VITE_WORKFLOW_CREDENTIALS === 'include' ? 'include' : 'omit'

// Captured from a browser session, not confirmed by the backend team. Further headers
// (accept, device-details, geo-location, time-zone, x-lumenore-studio) are added only after confirmation.
export const WORKFLOW_HEADERS = { 'application-id': APP_ID }
