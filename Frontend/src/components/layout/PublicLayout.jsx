import React from 'react';
import PublicHeader from './PublicHeader'; 

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PublicHeader />
      <main className="flex-1 flex flex-col items-center justify-center"> 
        <div className="w-full max-w-4xl px-4 py-8"> 
          {children}
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <p>&copy; {new Date().getFullYear()} PlanPal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PublicLayout;