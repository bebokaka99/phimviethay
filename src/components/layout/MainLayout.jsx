import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer'; // Import Footer mới

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-red-600 selection:text-white">
      <Header />
      
      {/* Phần nội dung chính sẽ thay đổi theo từng trang */}
      <main className="flex-1 w-full">
          <Outlet /> 
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;