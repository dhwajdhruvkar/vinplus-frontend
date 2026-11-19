import { useState } from 'react'

const FIELDS = [['name', 'Full Name'], ['username', 'Username'], ['designation', 'Designation'], ['department', 'Department'], ['email', 'Email Address']]

export default function ProfileDrawer({ profile, onSave, onToast, onClose }) {
  const [form, setForm] = useState(profile)

  const save = () => {
    const next = Object.fromEntries(FIELDS.map(([key]) => [key, (form[key] || '').trim().slice(0, 120)]))
    if (!next.name || !next.username) return onToast('Name and username are required')
    if (next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) return onToast('Enter a valid email address')
    setForm(next)
    onSave(next)
    onToast('Manager profile saved in this browser')
  }

  return (
    <>
      <div className="drawerHeader">
        <div><div className="drawerEyebrow">MANAGER ACCOUNT</div><h2>My Profile</h2><div className="sub">{`${profile.designation} · ${profile.department}`}</div></div>
        <button className="btn" onClick={onClose}>✕ Close</button>
      </div>
      <div className="drawerBody">
        <section className="drawerSection">
          <h3>Manager Profile Details</h3>
          <div className="profileRow">
            {FIELDS.map(([key, label]) => (
              <div key={key}>
                <label className="formLabel" htmlFor={`profile-${key}`}>{label}</label>
                <input id={`profile-${key}`} className="input profileInput" type={key === 'email' ? 'email' : 'text'} maxLength={120} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="drawerActions"><button className="btn" onClick={onClose}>Close</button><button className="btn primary" onClick={save}>Save Profile</button></div>
        </section>
        <section className="profileSecurity">
          <h4>Account Security</h4>
          <p className="sub">Changing a password requires the dealership authentication system. This standalone wireframe never collects passwords.</p>
          <button className="btn" onClick={() => onToast('A password change requires secure authentication. No passwords are collected here.')}>Change Password · Requires Login Integration</button>
        </section>
      </div>
    </>
  )
}
