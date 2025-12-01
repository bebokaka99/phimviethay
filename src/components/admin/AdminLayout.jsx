import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';
import { FaChartBar, FaUsers, FaComments, FaSignOutAlt, FaHome } from 'react-icons/fa';
import Logo from '../common/Logo';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  // Bảo vệ trang Admin
  useEffect(() => {
      if (!user || user.role !== 'admin') {
          alert('Bạn không có quyền truy cập trang này!');
          navigate('/');
      }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  const menuItems = [
      { name: 'Thống kê', path: '/admin', icon: <FaChartBar /> },
      { name: 'Người dùng', path: '/admin/users', icon: <FaUsers /> },
      { name: 'Bình luận', path: '/admin/comments', icon: <FaComments /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-[#111] border-r border-white/10 flex flex-col fixed h-full">
          <div className="p-6 border-b border-white/10 flex justify-center">
              <Logo />
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => (
                  <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                          location.pathname === item.path 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                      {item.icon} {item.name}
                  </button>
              ))}
          </nav>

          <div className="p-4 border-t border-white/10">
              <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition text-sm font-bold mb-2">
                  <FaHome /> Về trang chủ
              </button>
              <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/20 rounded-xl transition text-sm font-bold">
                  <FaSignOutAlt /> Đăng xuất
              </button>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64 p-8">
          <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;