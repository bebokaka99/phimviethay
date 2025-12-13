import React, { useEffect, useState } from 'react';
import { getAdminStats } from '../../services/adminService';
import { FaUsers, FaComments, FaHeart, FaEye, FaSpinner } from 'react-icons/fa';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 shadow-lg flex items-center gap-4 hover:bg-[#1f1f1f] transition-colors">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${color} bg-opacity-20`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-black text-white">{value !== null ? value.toLocaleString() : '-'}</h3>
        </div>
    </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      getAdminStats()
        .then(data => setStats(data))
        .catch(err => console.error("Dashboard Error:", err))
        .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-20"><FaSpinner className="animate-spin text-3xl text-gray-500"/></div>;

  return (
    <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-black text-white mb-8 border-l-4 border-red-600 pl-4">Tổng Quan Hệ Thống</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Thành viên" value={stats?.totalUsers || 0} icon={<FaUsers />} color="text-blue-500 bg-blue-500" />
            <StatCard title="Bình luận" value={stats?.totalComments || 0} icon={<FaComments />} color="text-green-500 bg-green-500" />
            <StatCard title="Lượt lưu phim" value={stats?.totalFavorites || 0} icon={<FaHeart />} color="text-red-500 bg-red-500" />
            <StatCard title="Tổng lượt xem" value={stats?.totalViews || 0} icon={<FaEye />} color="text-purple-500 bg-purple-500" />
        </div>
        
        <div className="mt-10 p-12 text-center border-2 border-dashed border-white/5 rounded-2xl text-gray-600 flex flex-col items-center justify-center h-64">
            <p className="font-bold text-lg mb-2">Biểu đồ tăng trưởng</p>
            <p className="text-sm">Tính năng đang phát triển...</p>
        </div>
    </div>
  );
};

export default Dashboard;