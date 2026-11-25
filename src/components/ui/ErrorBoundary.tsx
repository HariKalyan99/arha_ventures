import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'

type Props = {
  children: ReactNode
  /** Remount / clear when this changes (e.g. route pathname). */
  resetKeys?: unknown[]
  variant?: 'page' | 'section'
  onError?: (error: Error, info: ErrorInfo) => void
}

type State = {
  error: Error | null
}

/**
 * Catches React render errors and shows the branded ErrorFallback
 * instead of a blank screen or the default client crash UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
    this.props.onError?.(error, info)
  }

  componentDidUpdate(prevProps: Props) {
    if (!this.state.error || !this.props.resetKeys) return
    const prev = prevProps.resetKeys ?? []
    const next = this.props.resetKeys
    if (prev.length !== next.length || prev.some((k, i) => !Object.is(k, next[i]))) {
      this.reset()
    }
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.reset}
          variant={this.props.variant ?? 'page'}
        />
      )
    }
    return this.props.children
  }
}
