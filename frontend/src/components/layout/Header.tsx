import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import { useTheme } from '../../context/ThemeContext';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-blue-700 dark:bg-blue-900 text-white shadow-md transition-colors duration-200">
      <Container className="py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .022-.012.043-.014.065a.995.995 0 01-.695-.34l-2.5-2.5a1 1 0 11.414-1.414l.866.866V7.332l1.85-.79a1 1 0 00.002-1.84L3.592 2.84l6.012-2.57a1 1 0 01.788 0l6.012 2.57-3.952 1.71a1 1 0 00-.002 1.84l1.85.79v-.674l.866-.866a1 1 0 111.414 1.414l-2.5 2.5a.999.999 0 01-.695.34c-.002-.022-.014-.043-.014-.065l.002-1.069-2.328-.996a1 1 0 11.788-1.838l4 1.714c.13.056.252.14.356.257l2.644-1.131a1 1 0 000-1.84l-7-3z" />
                <path d="M4 11.107v8.787a1 1 0 00.526.881l7 3.5a1 1 0 00.948 0l7-3.5a1 1 0 00.526-.88v-8.788l-7.526 3.225a1 1 0 01-.948 0L4 11.107z" />
              </svg>
              <h1 className="text-2xl font-bold">CourseGPT</h1>
            </Link>
          </div>
          
          <div className="items-center space-x-6 flex">
            <nav className="hidden md:flex">
              <ul className="flex space-x-6">
                <li>
                  <Link to="/" className="hover:text-blue-200 transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-blue-200 transition-colors">Courses</Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-blue-200 transition-colors">About</Link>
                </li>
              </ul>
            </nav>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-blue-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header; 