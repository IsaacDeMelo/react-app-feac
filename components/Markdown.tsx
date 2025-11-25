import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-invert prose-sm max-w-none break-words ${className}`}>
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <div className="bg-zinc-900 rounded p-2 my-2 overflow-x-auto border border-zinc-800">
                <code className={className} {...props}>
                  {children}
                </code>
              </div>
            ) : (
              <code className="bg-zinc-800 px-1 py-0.5 rounded text-pink-300" {...props}>
                {children}
              </code>
            );
          },
          a({ node, children, ...props }) {
            return (
              <a 
                className="text-blue-400 hover:text-blue-300 underline" 
                target="_blank" 
                rel="noopener noreferrer" 
                {...props}
              >
                {children}
              </a>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};