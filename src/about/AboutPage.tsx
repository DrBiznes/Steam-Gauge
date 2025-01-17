import type { ReactNode } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { TableOfContents } from './TableOfContents';
import { Note } from './Note';
import AboutContent from './about.mdx';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import './about.css';

interface ComponentProps {
  children?: ReactNode;
  [key: string]: any;
}

interface LinkProps extends ComponentProps {
  href?: string;
}

interface ImageProps extends ComponentProps {
  src?: string;
  alt?: string;
}

const createId = (text: string) => {
  if (typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

function AboutSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div className="mb-8">
        <Skeleton className="h-24 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton 
                  key={j} 
                  className="h-4" 
                  style={{ width: `${Math.random() * 20 + 80}%` }} 
                /> 
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function About() {
  const components = {
    h1: ({ children, ...props }: ComponentProps) => {
      const id = createId(children?.toString() || '');
      return (
        <h1 
          id={id}
          className="text-4xl font-black mb-8 font-sans text-foreground scroll-mt-8 bg-primary/10 px-4 py-2 rounded-lg" 
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }: ComponentProps) => {
      const id = createId(children?.toString() || '');
      return (
        <h2 
          id={id}
          className="text-3xl font-black mt-16 mb-8 font-sans text-foreground scroll-mt-8 bg-primary/10 px-4 py-2 rounded-lg" 
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: ComponentProps) => {
      const id = createId(children?.toString() || '');
      return (
        <h3 
          id={id}
          className="text-2xl font-black mt-12 mb-6 font-sans text-foreground scroll-mt-8 bg-primary/10 px-4 py-2 rounded-lg" 
          {...props}
        >
          {children}
        </h3>
      );
    },
    p: ({ children }: ComponentProps) => (
      <p className="mb-6 leading-relaxed text-foreground">
        {children}
      </p>
    ),
    ul: ({ children }: ComponentProps) => (
      <ul className="list-disc pl-6 mb-6 text-foreground space-y-2">
        {children}
      </ul>
    ),
    li: ({ children }: ComponentProps) => (
      <li>{children}</li>
    ),
    pre: ({ children }: ComponentProps) => (
      <div className="my-4 rounded-lg border border-border bg-card overflow-hidden">
        <div className="relative overflow-x-auto py-4 px-4">
          {children}
        </div>
      </div>
    ),
    code: ({ children }: ComponentProps) => (
      <code className="text-primary px-1 py-0.5 bg-muted rounded whitespace-pre">
        {children}
      </code>
    ),
    a: ({ children, href }: LinkProps) => (
      <a 
        href={href} 
        className="text-primary hover:text-primary/80 underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }: ImageProps) => (
      <figure className="my-8 flex flex-col items-center">
        <img 
          src={src} 
          alt={alt} 
          className="rounded-lg shadow-lg max-w-full h-auto"
        />
        {alt && (
          <figcaption className="mt-2 text-sm text-muted-foreground italic w-full text-center">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
    blockquote: ({ children }: ComponentProps) => (
      <blockquote className="border-l-4 border-primary/50 pl-4 italic my-4 text-muted-foreground">
        {children}
      </blockquote>
    ),
    Note: ({ number, children }: { number: number; children: ReactNode }) => (
      <Note number={number}>{children}</Note>
    ),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-[120rem] mx-auto px-4 py-16 flex justify-center flex-grow relative">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,_1fr)_300px] gap-12 w-full">
          {/* Table of Contents - Left Column */}
          <motion.div 
            className="hidden lg:block lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] overflow-y-auto pr-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TableOfContents />
          </motion.div>

          {/* Main Content - Middle Column */}
          <motion.div 
            className="min-w-0 w-full max-w-3xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Header Title Area */}
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 font-sans text-foreground leading-tight bg-primary/10 px-6 py-4 rounded-lg">
                Steam Gauge
              </h1>
              <div className="text-xl text-muted-foreground mb-2">
                Your Ultimate Steam Library Analysis Tool
              </div>
              <div className="text-muted-foreground">
                January 2024
              </div>
            </motion.div>

            {/* MDX Content Area */}
            <div className="prose prose-invert prose-lg max-w-none">
              <AnimatePresence mode="wait">
                <Suspense fallback={<AboutSkeleton />}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <MDXProvider components={components}>
                      <AboutContent />
                    </MDXProvider>
                  </motion.div>
                </Suspense>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Notes Area - Right Column */}
          <motion.div 
            className="hidden lg:block lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] overflow-y-auto pl-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Notes will be positioned here by the Note component */}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 