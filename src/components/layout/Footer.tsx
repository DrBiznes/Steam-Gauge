import { Github, Twitter, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { type HTMLAttributes } from "react"

export function Footer({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t border-border/40 bg-[#F74843] py-6 mt-auto", className)} {...props}>
      <div className="container flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <a
            href="https://github.com/jamino30"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-white/75 hover:text-white transition-colors"
            )}
          >
            <Github className="h-6 w-6" />
          </a>
          <a
            href="https://twitter.com/jamino30"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-white/75 hover:text-white transition-colors"
            )}
          >
            <Twitter className="h-6 w-6" />
          </a>
          <a
            href="https://jamino.dev"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-white/75 hover:text-white transition-colors"
            )}
          >
            <Globe className="h-6 w-6" />
          </a>
        </div>
        <div className="flex flex-col items-center gap-2 text-sm text-white/75">
          <p>© 2025 jamino. MIT License</p>
          <p>Not affiliated with Valve Corporation</p>
        </div>
      </div>
    </footer>
  )
}