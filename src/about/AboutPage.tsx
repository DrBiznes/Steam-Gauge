import { TableOfContents } from './TableOfContents'
import AboutContent from './about.mdx'
import './about.css'

export function AboutPage() {
  return (
    <div className="about-container">
      <aside className="toc-sidebar">
        <TableOfContents />
      </aside>
      <main className="about-content">
        <AboutContent />
      </main>
      <aside className="notes-container">
        {/* Notes will be dynamically inserted here by the Note component */}
      </aside>
    </div>
  )
}
