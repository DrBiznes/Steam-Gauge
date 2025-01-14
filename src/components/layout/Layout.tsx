import { Header } from "./Header"
import { Footer } from "./Footer"
import { useLocation } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { AnimatePresence, LayoutGroup } from "framer-motion"

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
    <LayoutGroup>
      <div className="min-h-screen flex flex-col overflow-hidden">
        <div className={`bg-base ${getBackgroundClass()}`} />
        <Header />
        <AnimatePresence mode="wait">
          <main className="flex-1">
            {children}
          </main>
        </AnimatePresence>
        <Footer />
        <Toaster />
      </div>
    </LayoutGroup>
  )
}