import { useState } from 'react'
import Dashboard from './Dashboard.jsx'
import LoginScreen from './components/LoginScreen.jsx'
import CompanyBrandingProvider from './company/CompanyBrandingProvider.jsx'
import { resolveCompany } from './company/companyContext.js'

const SESSION_KEY = 'vinplus-share-demo-manager-session-v1'

function readSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'manager'
  } catch {
    return false
  }
}

export default function App() {
  const [signedIn, setSignedIn] = useState(readSession)

  const login = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'manager')
    } catch {
      // the session still works for this page view
    }
    setSignedIn(true)
    window.scrollTo(0, 0)
  }

  const logout = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // nothing to clear
    }
    setSignedIn(false)
    window.scrollTo(0, 0)
  }

  if (!signedIn) return <LoginScreen onLogin={login} />
  return (
    <CompanyBrandingProvider company={resolveCompany()}>
      <Dashboard onLogout={logout} />
    </CompanyBrandingProvider>
  )
}
