import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Rendered instead of the children if they throw (e.g. a lazy chunk fails to load). */
  fallback?: ReactNode
}

/**
 * Swallows render errors from a decorative subtree so a failed lazy import (blocked/offline
 * three.js chunk) degrades to the fallback instead of taking the page down.
 */
export class SilentErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}
