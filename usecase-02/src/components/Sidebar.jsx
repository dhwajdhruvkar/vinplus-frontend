import crest from '../assets/crest.png'

export default function Sidebar({ tab, onGoto }) {
  return (
    <aside className="side">
      <div className="logo">
        <div className="crest"><img src={crest} alt="Gold Ferrari prancing-horse logo from supplied reference screenshot" loading="eager" decoding="async" /></div>
        <div className="ferrari">Ferrari</div>
        <small>FERRARI FORT LAUDERDALE</small>
        <div className="redline"></div>
      </div>
      <nav className="nav" id="nav">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => onGoto('overview')}>▦ &nbsp;Policy Work Control</button>
      </nav>
    </aside>
  )
}
