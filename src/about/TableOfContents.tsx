import React, { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { useLocation, useNavigate } from 'react-router-dom';

export function TableOfContents() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const sections = [
    { id: 'steam-gauge', text: 'Steam Gauge' },
    { 
      id: 'features', 
      text: 'Features',
      subsections: [
        { id: 'library-analysis', text: 'Library Analysis' },
        { id: 'game-discovery', text: 'Game Discovery' },
        { id: 'playtime-insights', text: 'Playtime Insights' }
      ]
    },
    { id: 'how-it-works', text: 'How It Works' },
    { 
      id: 'tech-stack', 
      text: 'Tech Stack',
      subsections: [
        { id: 'frontend', text: 'Frontend' },
        { id: 'backend', text: 'Backend' }
      ]
    },
    { id: 'future-plans', text: 'Future Plans' },
  ];

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const yOffset = -20;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash]);

  const handleSectionClick = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (sectionId === 'steam-gauge') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigate('/about');
      return;
    }

    navigate(`/about#${sectionId}`);

    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -20;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-8">
      <h4 className="text-4xl font-black font-sans text-foreground mb-6 bg-[#168f48] text-white px-4 py-2">
        Contents
      </h4>
      <Separator className="mb-8" />
      <div className="pr-4">
        <ul className="space-y-6">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={section.id === 'steam-gauge' ? '#' : `#${section.id}`}
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