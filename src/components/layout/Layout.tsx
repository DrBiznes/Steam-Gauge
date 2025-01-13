import { Header } from "./Header"
import { Footer } from "./Footer"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#F74843] flex flex-col relative">
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer className="relative z-10" />
    </div>
  )
}