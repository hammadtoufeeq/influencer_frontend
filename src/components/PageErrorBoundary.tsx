import { Component, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { tr } from '../i18n/translated'

// Kisi page mein render ka error aaye to poori app kaali screen na ho:
// navbar / footer rehte hain, page ki jagah ye message. Naye page pe (key) khud reset
class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </span>
        <h1 className="mt-4 text-lg font-semibold">{tr('pageError.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{tr('pageError.text')}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
        >
          {tr('pageError.reload')}
        </button>
      </div>
    )
  }
}

export default PageErrorBoundary
