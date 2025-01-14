import { Header } from "./Header"
import { Footer } from "./Footer"
import { useLocation } from "react-router-dom"

type LayoutProps = {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const path = location.pathname

  // Define background classes based on route
  const getBackgroundClass = () => {
    // Check if path starts with /gauge
    if (path.startsWith('/gauge')) {
      return 'bg-gauge'
    }

    switch (path) {
      case '/':
        return 'bg-home'
      default:
        return 'bg-home'
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`bg-base ${getBackgroundClass()}`} />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}