import "./Logo.css"

export function Logo() {
  return (
    <div className="logo">
      <svg className="logo-icon" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#10a37f"/>
        <path d="M7 15.5c1-2 2.5-3 4-3s2 .8 3 2c1 1.2 2 2 3.5 2" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"/>
        <circle cx="7.5" cy="9" r="1.5" stroke="#fff" strokeWidth="1.4" fill="none"/>
        <circle cx="16" cy="9" r="1" fill="#fff"/>
      </svg>
      <span className="logo-text">findingnemo</span>
    </div>
  )
}
