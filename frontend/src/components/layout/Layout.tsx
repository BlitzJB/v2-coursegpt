import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <main className="flex-grow bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 