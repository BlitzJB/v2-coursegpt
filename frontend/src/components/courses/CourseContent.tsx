import React from 'react';
import { CourseContent as CourseContentType } from '../../types/course';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
import type { Components } from 'react-markdown';

type CourseContentProps = {
  content: CourseContentType;
};

// Define a type for code props that includes 'inline'
interface CodeComponentProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const CourseContent: React.FC<CourseContentProps> = ({ content }) => {
  const { frontmatter, content: markdownContent } = content;

  // Custom code component
  const CodeComponent = ({ inline, className, children, ...props }: CodeComponentProps) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <code className={className} {...props}>
        {children}
      </code>
    ) : (
      <code className="bg-gray-100 text-red-500 px-1 py-0.5 rounded" {...props}>
        {children}
      </code>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2.5">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold mb-2">{frontmatter.title}</h1>
        <div className="text-sm text-gray-600">
          <p>Unit {frontmatter.unit_number}: {frontmatter.unit}</p>
          <p>Course: {frontmatter.course}</p>
        </div>
        
        {frontmatter.learning_objectives && frontmatter.learning_objectives.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-md font-semibold text-blue-800 mb-2">Learning Objectives</h3>
            <ul className="list-disc list-inside space-y-1">
              {frontmatter.learning_objectives.map((objective, index) => (
                <li key={index} className="text-blue-700">{objective}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="prose prose-blue max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
          components={{
            // Override components for better styling
            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="my-3" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc ml-6 my-3" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal ml-6 my-3" {...props} />,
            li: ({ node, ...props }) => <li className="ml-2 mb-1" {...props} />,
            code: CodeComponent as Components['code'],
            pre: ({ node, ...props }) => (
              <pre className="bg-gray-800 rounded-md overflow-x-auto p-4 text-sm my-4" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a className="text-blue-600 hover:text-blue-800 hover:underline" {...props} />
            ),
            hr: ({ node, ...props }) => (
              <hr className="my-8 border-t-2 border-gray-200" {...props} />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full divide-y divide-gray-200" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th className="px-4 py-2 bg-gray-100 font-semibold text-left" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-4 py-2 border-t border-gray-200" {...props} />
            ),
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default CourseContent; 