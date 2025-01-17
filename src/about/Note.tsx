import React, { useEffect, useRef } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

interface NoteProps {
  number: number;
  children: React.ReactNode;
}

export function Note({ number, children }: NoteProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Create the note element in the sidebar
    const notesContainer = document.querySelector('.notes-container');
    if (notesContainer && triggerRef.current) {
      const noteElement = document.createElement('div');
      noteElement.setAttribute('data-note', number.toString());
      noteElement.className = 'note-content';
      
      // Position the note at the same height as its trigger
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const containerRect = notesContainer.getBoundingClientRect();
      noteElement.style.top = `${triggerRect.top - containerRect.top}px`;
      
      const noteContent = document.createElement('div');
      noteContent.className = 'shadow-lg';
      
      const innerContent = document.createElement('div');
      innerContent.className = 'flex items-start gap-3';
      
      const numberSpan = document.createElement('span');
      numberSpan.className = "inline-flex items-center justify-center px-2 h-[1.4em] text-sm font-sans bg-primary/10 text-primary border border-primary/20";
      numberSpan.textContent = number.toString();
      
      const textContent = document.createElement('div');
      textContent.className = 'flex-1 text-sm leading-relaxed text-foreground';
      textContent.appendChild(document.createElement('div')).textContent = children?.toString() || '';
      
      innerContent.appendChild(numberSpan);
      innerContent.appendChild(textContent);
      noteContent.appendChild(innerContent);
      noteElement.appendChild(noteContent);
      notesContainer.appendChild(noteElement);

      // Create intersection observer for the trigger
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            noteElement.setAttribute('data-visible', entry.isIntersecting.toString());
          });
        },
        {
          rootMargin: '-10% 0px -10% 0px',
          threshold: [0, 0.1]
        }
      );

      if (triggerRef.current) {
        observer.observe(triggerRef.current);
      }

      // Update note position on scroll
      const updatePosition = () => {
        if (triggerRef.current) {
          const newTriggerRect = triggerRef.current.getBoundingClientRect();
          const newContainerRect = notesContainer.getBoundingClientRect();
          noteElement.style.top = `${newTriggerRect.top - newContainerRect.top}px`;
        }
      };

      window.addEventListener('scroll', updatePosition, { passive: true });
      window.addEventListener('resize', updatePosition, { passive: true });

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
        noteElement.remove();
      };
    }
  }, [number, children]);

  const numberIndicatorClass = "inline-flex items-center justify-center px-2 h-[1.4em] text-sm font-sans bg-primary/10 text-primary rounded-full border border-primary/20";

  return (
    <span 
      ref={triggerRef}
      data-note-trigger={number}
      className={cn(numberIndicatorClass, "cursor-help align-text-top -mt-1")}
    >
      {number}
    </span>
  );
} 