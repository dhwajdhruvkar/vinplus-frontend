import { useState } from 'react'
import Dashboard from './Dashboard.jsx'
import LoginScreen from './components/LoginScreen.jsx'

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

  return signedIn ? <Dashboard onLogout={logout} /> : <LoginScreen onLogin={login} />
}
