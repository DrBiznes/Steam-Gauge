import { TableOfContents } from './TableOfContents'
import AboutContent from './about.mdx'
import './about.css'
import { useLayoutEffect, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export function AboutPage() {
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle hash-based navigation
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        // First try to find the element directly
        let element = document.getElementById(hash);
        
        // If not found, try to find the heading text
        if (!element && contentRef.current) {
          const headings = contentRef.current.querySelectorAll('h1, h2, h3');
          for (const heading of headings) {
            if (heading.textContent?.toLowerCase().replace(/\s+/g, '-') === hash) {
              element = heading as HTMLElement;
              break;
            }
          }
        }

        if (element) {
          const yOffset = -120; // Adjust based on your header height
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({
            top: y,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [location.hash]);

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
        <TableOfContents contentRef={contentRef} />
      </motion.aside>
      <motion.main 
        className="about-content" 
        variants={itemVariants}
        ref={contentRef}
      >
        <AboutContent />
      </motion.main>
      <motion.aside className="notes-container" variants={itemVariants}>
        {/* Notes will be dynamically inserted here by the Note component */}
      </motion.aside>
    </motion.div>
  )
}
