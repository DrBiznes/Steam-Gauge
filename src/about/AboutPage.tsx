import { TableOfContents } from './TableOfContents'
import AboutContent from './about.mdx'
import './about.css'
import { useLayoutEffect } from 'react'
import { motion } from 'framer-motion'

export function AboutPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="about-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.aside className="toc-sidebar" variants={itemVariants}>
        <TableOfContents />
      </motion.aside>
      <motion.main className="about-content" variants={itemVariants}>
        <AboutContent />
      </motion.main>
      <motion.aside className="notes-container" variants={itemVariants}>
        {/* Notes will be dynamically inserted here by the Note component */}
      </motion.aside>
    </motion.div>
  )
}
