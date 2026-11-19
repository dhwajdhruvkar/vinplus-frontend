import { useState } from 'react'
import { companyShortName, useCompany } from '../company/companyContext.js'

function CompanyLogo({ company }) {
  const [failed, setFailed] = useState(false)
  if (!company.logoUrl || failed) return <span className="crestFallback" aria-hidden="true">{company.companyName.charAt(0).toUpperCase()}</span>
  return <img src={company.logoUrl} alt={`${company.companyName} logo`} loading="eager" decoding="async" onError={() => setFailed(true)} />
}

export default function Sidebar({ tab, onGoto }) {
  const company = useCompany()
  return (
    <aside className="side">
      <div className="logo">
        <div className="crest"><CompanyLogo key={company.logoUrl} company={company} /></div>
        <div className="ferrari">{companyShortName(company)}</div>
        <small>{company.companyName.toUpperCase()}</small>
        <div className="redline"></div>
      </div>
      <nav className="nav" id="nav">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => onGoto('overview')}>▦ &nbsp;Policy Work Control</button>
      </nav>
    </aside>
  )
}
