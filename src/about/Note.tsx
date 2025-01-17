import React, { useEffect, useRef, useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

interface NoteProps {
  number: number;
  children: React.ReactNode;
}

export function Note({ number, children }: NoteProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateNotePosition = () => {
      if (!triggerRef.current || !noteRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const noteElement = noteRef.current;
      
      noteElement.style.top = `${triggerRect.top}px`;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const noteId = entry.target.getAttribute('data-note-trigger');
          const noteElement = document.querySelector(`[data-note="${noteId}"]`);
          
          if (noteElement) {
            if (entry.isIntersecting) {
              noteElement.classList.add('active');
              updateNotePosition();
            } else {
              noteElement.classList.remove('active');
            }
          }
        });
      },
      {
        rootMargin: '-10% 0px -30% 0px',
        threshold: [0, 0.2, 1]
      }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    window.addEventListener('scroll', updateNotePosition);
    window.addEventListener('resize', updateNotePosition);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateNotePosition);
      window.removeEventListener('resize', updateNotePosition);
    };
  }, [number]);

  const numberIndicatorClass = "inline-flex items-center justify-center px-2 h-[1.4em] text-sm font-sans bg-primary/10 text-primary rounded-full border border-primary/20";

  return (
    <>
      <HoverCard open={isOpen} onOpenChange={setIsOpen}>
        <HoverCardTrigger asChild>
          <span 
            ref={triggerRef}
            data-note-trigger={number}
            className={cn(numberIndicatorClass, "cursor-help align-text-top -mt-1")}
            onClick={() => setIsOpen(!isOpen)}
            onTouchEnd={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
          >
            {number}
          </span>
        </HoverCardTrigger>
        <HoverCardContent 
          className="font-sans md:hidden bg-card text-foreground border border-border/50 backdrop-blur-sm"
          onPointerDownOutside={() => setIsOpen(false)}
        >
          {children}
        </HoverCardContent>
      </HoverCard>

      <div 
        ref={noteRef}
        className="hidden md:block fixed note-content opacity-0 transition-opacity duration-200" 
        data-note={number}
        style={{
          right: '2rem',
          width: '280px',
          maxWidth: '300px'
        }}
      >
        <div className="font-sans text-foreground bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border/50 shadow-lg">
          <div className="flex items-start gap-3">
            <span className={numberIndicatorClass}>
              {number}
            </span>
            <div className="flex-1 text-sm leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 