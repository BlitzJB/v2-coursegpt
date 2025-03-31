import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-12 transition-colors duration-200">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">CourseGPT</h3>
            <p className="text-gray-600 dark:text-gray-300">
              AI-powered course generation and learning platform.
              Explore our vast library of high-quality courses on various topics.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">Home</Link>
              </li>
              <li>
                <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">Courses</Link>
              </li>
              <li>
                <Link to="#" className="text-blue-600 dark:text-blue-400 hover:underline">About</Link>
              </li>
              <li>
                <Link to="#" className="text-blue-600 dark:text-blue-400 hover:underline">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Contact</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Need help or have questions? Get in touch with our team.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Email: info@coursegpt.ai
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} CourseGPT. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 