import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">CourseGPT</h3>
            <p className="text-gray-600">
              AI-powered course generation and learning platform.
              Explore our vast library of high-quality courses on various topics.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-blue-600 hover:underline">Home</Link>
              </li>
              <li>
                <Link to="/" className="text-blue-600 hover:underline">Courses</Link>
              </li>
              <li>
                <Link to="#" className="text-blue-600 hover:underline">About</Link>
              </li>
              <li>
                <Link to="#" className="text-blue-600 hover:underline">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-600">
              Need help or have questions? Get in touch with our team.
            </p>
            <p className="text-gray-600 mt-2">
              Email: info@coursegpt.ai
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} CourseGPT. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 