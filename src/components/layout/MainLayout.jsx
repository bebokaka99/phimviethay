import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
  return (
    // QUAN TRỌNG: bg-transparent để lộ nền Gradient đỏ của body ra
    <div className="flex flex-col min-h-screen bg-transparent text-white font-sans selection:bg-red-600 selection:text-white">
      <Header />
      
      <main className="flex-1 w-full">
          <Outlet /> 
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;