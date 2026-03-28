import type { ReactNode } from "react"
import "./Layout.css"

interface LayoutProps {
  left: ReactNode
  middle: ReactNode
  right: ReactNode
}

export function Layout({ left, middle, right }: LayoutProps) {
  return (
    <div className="layout">
      <div className="layout-left">{left}</div>
      <div className="layout-middle">{middle}</div>
      <div className="layout-right">{right}</div>
    </div>
  )
}
