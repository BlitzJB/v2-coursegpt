import React from 'react';
import { Link } from 'react-router-dom';

export type BreadcrumbItem = {
  label: string;
  link?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex text-sm text-gray-600 dark:text-gray-400 mb-6 overflow-x-auto" aria-label="Breadcrumb">
      <ol className="inline-flex items-center flex-wrap space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 whitespace-nowrap">
            <svg 
              className="w-4 h-4 mr-1" 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="hidden xs:inline">Home</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <div className="flex items-center">
              <svg 
                className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  fillRule="evenodd" 
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                  clipRule="evenodd"
                />
              </svg>
              {item.link ? (
                <Link 
                  to={item.link} 
                  className="ml-1 md:ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 whitespace-nowrap truncate max-w-[100px] sm:max-w-[150px] md:max-w-none"
                  title={item.label}
                >
                  {item.label}
                </Link>
              ) : (
                <span 
                  className="ml-1 md:ml-2 text-gray-500 dark:text-gray-400 whitespace-nowrap truncate max-w-[100px] sm:max-w-[150px] md:max-w-none" 
                  title={item.label}
                >
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 