import React from 'react';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLDivElement>;
}

export function TableOfContents({ contentRef }: TableOfContentsProps) {
  const navigate = useNavigate();
  
  const sections = [
    { id: 'about-steam-gauge', text: 'About Steam Gauge' },
    { 
      id: 'how-the-hing-works', 
      text: 'How The Hing Works',
      subsections: [
        { id: 'the-apis', text: 'The APIs' },
        { id: 'zustand', text: 'Zustand' }
      ]
    },
    { 
      id: 'the-games', 
      text: 'The Games',
      subsections: [
        { id: 'gauge-ing-game', text: 'Gauge-ing Game' },
        { id: 'cover-artfuscation', text: 'Cover Artfuscation' }
      ]
    },
    { id: 'design', text: 'Design' },
    { id: 'acknowledgments', text: 'Acknowledgments' }
  ];

  const handleSectionClick = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!contentRef.current) return;

    const headings = contentRef.current.querySelectorAll('h1, h2, h3');
    let targetElement: HTMLElement | null = null;

    // First try to find by ID
    targetElement = document.getElementById(sectionId);

    // If not found, try to find by heading text
    if (!targetElement) {
      for (const heading of headings) {
        if (heading.textContent?.toLowerCase().replace(/\s+/g, '-') === sectionId) {
          targetElement = heading as HTMLElement;
          break;
        }
      }
    }

    if (targetElement) {
      const yOffset = -120; // Adjust based on your header height
      const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });

      // Update URL hash after scrolling
      navigate(`/about#${sectionId}`);
    }
  };

  return (
    <nav className="sticky top-8">
      <h4 className="text-4xl font-black font-sans text-foreground mb-8 bg-[#168f48] text-white px-4 py-2">
        Contents
      </h4>
      <Separator className="mb-8" />
      <div className="pr-4">
        <ul className="space-y-6">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="block font-sans text-xl font-medium text-foreground hover:text-[#168f48] transition-colors"
                onClick={handleSectionClick(section.id)}
              >
                {section.text}
              </a>
              {section.subsections && (
                <ul className="ml-4 mt-4 space-y-3 border-l-2 border-[#168f48]/20 pl-4">
                  {section.subsections.map((subsection) => (
                    <li key={subsection.id}>
                      <a
                        href={`#${subsection.id}`}
                        className="block font-sans text-lg text-muted-foreground hover:text-[#168f48] transition-colors"
                        onClick={handleSectionClick(subsection.id)}
                      >
                        {subsection.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
} 