import { Github, Twitter, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

export function Footer({ className, ...props }: HTMLMotionProps<"footer">) {
  return (
    <motion.footer 
      layout
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 0.5
      }}
      className={cn("bg-[#2e2f31] py-6 mt-auto", className)} 
      {...props}
    >
      <div className="container flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <a
            href="https://github.com/DrBiznes/Steam-Gauge"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-white/75 hover:text-white transition-colors"
            )}
          >
            <Github className="h-6 w-6" />
          </a>
          <a
            href="https://twitter.com/DrBiznez"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-white/75 hover:text-white transition-colors"
            )}
          >
            <Twitter className="h-6 w-6" />
          </a>
          <a
            href="https://jamino.me"
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
          <p>© 2025 Jamino. MIT License</p>
          <p>Not affiliated with Valve Corporation</p>
        </div>
      </div>
    </motion.footer>
  )
}