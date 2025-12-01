import React, { useEffect, useState } from 'react';
import { getAdminStats } from '../../services/adminService';
import { FaUsers, FaComments, FaHeart, FaEye } from 'react-icons/fa';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 shadow-lg flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-black text-white">{value.toLocaleString()}</h3>
        </div>
    </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalComments: 0, totalFavorites: 0, totalViews: 0 });

  useEffect(() => {
      getAdminStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div>
        <h1 className="text-3xl font-black text-white mb-8">Tổng Quan Hệ Thống</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Thành viên" value={stats.totalUsers} icon={<FaUsers />} color="bg-blue-500/20 text-blue-500" />
            <StatCard title="Bình luận" value={stats.totalComments} icon={<FaComments />} color="bg-green-500/20 text-green-500" />
            <StatCard title="Lượt lưu phim" value={stats.totalFavorites} icon={<FaHeart />} color="bg-red-500/20 text-red-500" />
            <StatCard title="Lượt xem" value={stats.totalViews} icon={<FaEye />} color="bg-purple-500/20 text-purple-500" />
        </div>
        
        {/* Chỗ này sau này sẽ để biểu đồ hoặc danh sách mới nhất */}
        <div className="mt-10 p-10 text-center border-2 border-dashed border-white/5 rounded-2xl text-gray-500">
            Biểu đồ tăng trưởng sẽ hiển thị ở đây...
        </div>
    </div>
  );
};

export default Dashboard;