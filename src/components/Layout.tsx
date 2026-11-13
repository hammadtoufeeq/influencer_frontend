import { Outlet, useLocation } from 'react-router-dom'
import LiveUpdates from './LiveUpdates'
import ScrollManager from './ScrollManager'
import Navbar from './nav/Navbar'
import Footer from './Footer'
import PageErrorBoundary from './PageErrorBoundary'

function Layout() {
  const { pathname } = useLocation()
  const fullWidth = pathname === '/'
  // ✅ About page: max-w-6xl aur px-4 hata do taake statement band full width ho sake
  const aboutPage = pathname === '/about'

  return (
    <div className="starlight-bg flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <div className="sticky top-0 z-50 h-0">
        <Navbar />
      </div>
      <LiveUpdates />
      <ScrollManager />
      <main
        className={
          fullWidth
            ? 'w-full flex-1 pb-12'
            : aboutPage
              ? 'w-full flex-1 pb-8 pt-24 sm:pt-28'
              : 'mx-auto w-full max-w-6xl flex-1 px-4 pb-8 pt-24 sm:pt-28'
        }
      >
        <div key={pathname} className="motion-safe:animate-page-in">
          <PageErrorBoundary>
            <Outlet />
          </PageErrorBoundary>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Layout