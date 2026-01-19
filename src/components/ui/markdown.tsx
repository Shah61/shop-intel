import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content?: string | null;
  className?: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content, className }) => {
  // Safety check for content
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return (
      <div className={cn("space-y-4 text-sm", className)}>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Additional safety: try to render and fallback if there's an error
  try {
    return (
      <div className={cn("space-y-4 text-sm", className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headers
            h1: ({ children }) => (
              <h1 className="!text-3xl !md:text-4xl !font-black !text-foreground/90 !mb-6 !mt-8 first:mt-0 !pb-3 !border-b-2 !border-primary/30 !tracking-tight relative after:absolute after:bottom-[-2px] after:left-0 after:w-24 after:h-[2px] after:bg-primary">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="!text-2xl !md:text-3xl !font-extrabold !text-foreground/90 !mb-4 !mt-6 first:mt-0 !flex !items-center !gap-3 !pl-4 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/60 before:rounded-full">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="!text-xl !md:text-2xl !font-bold !text-foreground/80 !mb-3 !mt-5 first:mt-0 !flex !items-center !gap-2 before:!content-['#'] before:!text-primary/60 before:!font-normal">
                {children}
              </h3>
            ),
            
            // Paragraphs
            p: ({ children }) => (
              <p className="!text-base !leading-relaxed !text-foreground/70 !mb-4">
                {children}
              </p>
            ),
            
            // Lists
            ul: ({ children }) => (
              <ul className="!list-disc !list-inside !mb-2 !space-y-1 !text-sm !text-foreground">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="!list-decimal !list-inside !mb-2 !space-y-1 !text-sm !text-foreground">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="!text-sm !text-foreground !leading-relaxed">
                {children}
              </li>
            ),
            
            // Links
            a: ({ href, children }) => (
              <a 
                href={href} 
                className="text-primary hover:text-primary/80 underline"
                target="_blank" 
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            
            // Code
            code: ({ children, className }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
                    {children}
                  </code>
                );
              }
              return (
                <code className="block bg-muted p-3 rounded-md text-xs font-mono text-foreground overflow-x-auto">
                  {children}
                </code>
              );
            },
            
            // Pre (code blocks)
            pre: ({ children }) => (
              <pre className="bg-muted p-3 rounded-md text-xs font-mono text-foreground overflow-x-auto mb-3">
                {children}
              </pre>
            ),
            
            // Blockquotes
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary pl-4 py-2 mb-3 bg-muted/50 text-sm text-foreground italic">
                {children}
              </blockquote>
            ),
            
            // Tables
            table: ({ children }) => (
              <div className="overflow-x-auto mb-3">
                <table className="min-w-full border border-border rounded-md">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-muted/50">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody>
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="border-b border-border">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 text-left text-xs font-medium text-foreground">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-xs text-foreground">
                {children}
              </td>
            ),
            
            // Horizontal rule
            hr: () => (
              <hr className="border-border my-4" />
            ),
            
            // Strong and emphasis
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-foreground">
                {children}
              </em>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  } catch (error) {
    console.error('Markdown rendering error:', error, 'Content:', content);
    return (
      <div className={cn("space-y-4 text-sm", className)}>
        <p className="text-sm text-muted-foreground">Error loading markdown</p>
      </div>
    );
  }
};

export default Markdown; 