import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 border-transparent">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link
                className={cn(
                  "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-lg font-black text-white hover:bg-white/10 transition-colors"
                )}
                to="/"
              >
                Steam-Gauge
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
} 