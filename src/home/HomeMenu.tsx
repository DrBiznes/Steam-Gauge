import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import './HomeMenu.css'

const GAMES = [
  {
    id: 1,
    name: "Steam Gauge",
    path: "/gauge",
    description: "Dive deep into your Steam library analytics. Track your gaming habits, discover insights about your playtime, and understand your gaming preferences through detailed statistics and visualizations."
  },
  {
    id: 2,
    name: "Steam Guess",
    path: "/steam-guess",
    description: "Test your knowledge of Steam games in this engaging quiz game. Challenge yourself with questions about release dates, genres, developers, and more while learning about new titles."
  },
  {
    id: 3,
    name: "About",
    path: "/about",
    description: "Learn more about our Steam tools project, its development, and the technology behind it. Find out how we use the Steam API to bring you these unique gaming experiences."
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

export function GameList() {
  const navigate = useNavigate()

  return (
    <>
      <motion.div 
        className="menu-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h4 className="font-black text-4xl text-[#F74843]">Gaming is Good</h4>
        <p className="text-lg font-medium text-white/90 leading-relaxed mt-4">
          Welcome to our collection of innovative Steam tools and games. We've created these applications to enhance your Steam experience, helping you explore your gaming habits and discover new titles in unique ways.
        </p>
      </motion.div>
      
      <motion.div 
        className="menu-list"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {GAMES.map((game) => (
          <motion.div 
            key={game.id} 
            className="menu-item"
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="ghost"
              className="menu-button"
              onClick={() => navigate(game.path)}
            >
              <h3 className="menu-title">
                {game.name}
              </h3>
              <p className="menu-description">
                {game.description}
              </p>
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </>
  )
} 