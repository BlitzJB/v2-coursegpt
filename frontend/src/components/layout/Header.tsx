import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';

export const Header: React.FC = () => {
  return (
    <header className="bg-blue-700 text-white shadow-md">
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
          
          <nav>
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
        </div>
      </Container>
    </header>
  );
};

export default Header; 