import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import crest from '../assets/crest.png'

export default function LoginScreen({ onLogin }) {
  const [view, setView] = useState('login')
  const [error, setError] = useState('')
  const [resetShown, setResetShown] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const usernameRef = useRef(null)
  const emailRef = useRef(null)

  const submitLogin = (e) => {
    e.preventDefault()
    const ok = username.trim().toLowerCase() === 'manager' && password === 'demo123'
    setPassword('')
    if (ok) {
      setError('')
      onLogin()
    } else {
      setError('Incorrect demo credentials. Use manager / demo123.')
    }
  }

  const showView = (next, input) => {
    flushSync(() => {
      setView(next)
      setError('')
      setResetShown(false)
    })
    input.current.focus()
  }

  return (
    <section className="loginScreen" id="loginScreen" aria-label="VINPlus manager login">
      <div className="loginFormBox">
        <div className="loginBrandLogo"><img src={crest} alt="Ferrari prancing horse" /><span>FERRARI FORT LAUDERDALE</span></div>
        <h1 className="loginPageTitle">USER LOGIN</h1>
        <p className="demoLoginLabel">VINPLUS · POLICY WORK CONTROL</p>
        <div id="loginError" className="loginError" role="alert" hidden={!error}>{error}</div>
        <form id="loginForm" className="loginFields" autoComplete="off" hidden={view !== 'login'} onSubmit={submitLogin}>
          <div className="loginInputRow iconLeft">
            <span className="loginIconCircle" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="4" /><path d="M4.5 21c0-5.7 3.1-8.6 7.5-8.6s7.5 2.9 7.5 8.6" /></svg>
            </span>
            <div className="loginInputShell">
              <input id="loginUser" ref={usernameRef} name="username" type="text" placeholder="Username" aria-label="Username" autoComplete="username" required maxLength={80} value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>
          <div className="loginInputRow iconRight">
            <div className="loginInputShell">
              <input id="loginPassword" name="password" type="password" placeholder="Password" aria-label="Password" autoComplete="current-password" required maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <span className="loginIconCircle" aria-hidden="true">
              <svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /><circle cx="12" cy="15.7" r="1.2" /></svg>
            </span>
          </div>
          <div className="loginAux"><button type="button" className="loginLink" id="forgotPasswordButton" onClick={() => showView('forgot', emailRef)}>Forgot Password?</button></div>
          <button type="submit" className="loginPrimary">LOGIN</button>
        </form>
        <form id="forgotForm" className="forgotCard" hidden={view !== 'forgot'} onSubmit={(e) => { e.preventDefault(); setResetShown(true) }}>
          <h2>Forgot Password?</h2>
          <p>Enter your email to check password-recovery availability for this demo.</p>
          <label htmlFor="forgotEmail">Email address</label>
          <input type="email" id="forgotEmail" ref={emailRef} name="email" placeholder="your.email@example.com" required autoComplete="email" />
          <div className="forgotActions">
            <button type="button" id="forgotBackButton" onClick={() => showView('login', usernameRef)}>Back</button>
            <button type="submit" className="forgotSubmit">Continue</button>
          </div>
          <p className="forgotResult" id="forgotResult" role="status" hidden={!resetShown}>
            Password reset emails are not connected in this demonstration. No email has been sent. Contact your administrator when production authentication is configured.
          </p>
        </form>
        <p className="loginHint"><b>Demo access:</b> Username <b>manager</b> · Password <b>demo123</b>. This login is for preview only; do not enter real account credentials.</p>
      </div>
    </section>
  )
}
