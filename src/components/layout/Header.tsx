import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { Slash } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function Header() {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const getDisplayName = (segment: string) => {
    if (segment === 'steam-gauge') return 'Gauge Game'
    return segment.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-50 border-transparent">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Breadcrumb>
          <BreadcrumbList className="flex items-center text-xl font-black leading-none">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link 
                  to="/"
                  className="bg-[#F74843] text-white transition-colors hover:bg-[#ff5a55] px-4 py-2 leading-none"
                >
                  Steam-Gauge
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.map((segment, index) => (
              <React.Fragment key={index}>
                <BreadcrumbSeparator>
                  <Slash className="h-6 w-6 text-white/80" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {index === pathSegments.length - 1 ? (
                    <BreadcrumbPage className="bg-[#2F2F2F] text-white/90 px-4 py-2 leading-none">
                      {getDisplayName(segment)}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link 
                        to={`/${pathSegments.slice(0, index + 1).join('/')}`}
                        className="bg-[#1B2838] text-white/90 transition-colors hover:bg-[#2a3f5a] hover:text-white px-4 py-2 leading-none"
                      >
                        {getDisplayName(segment)}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
} 