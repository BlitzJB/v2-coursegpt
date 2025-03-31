import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import useDocumentTitle from '../hooks/useDocumentTitle';

const NotFoundPage: React.FC = () => {
  // Set document title
  useDocumentTitle('Page Not Found', '| Error 404');
  
  return (
    <Container className="py-16">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-700 mb-8">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition duration-200"
        >
          Go to Home
        </Link>
      </div>
    </Container>
  );
};

export default NotFoundPage; 