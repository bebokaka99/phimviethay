import React, { useEffect, useState } from 'react';
import { FaTrashAlt, FaUserShield, FaSearch, FaUser } from 'react-icons/fa';
import { getAllUsers, deleteUser } from '../../services/adminService';
import { getCurrentUser } from '../../services/authService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
      if(window.confirm('CẢNH BÁO: Bạn có chắc muốn xóa người dùng này? Hành động này sẽ xóa vĩnh viễn tài khoản và dữ liệu của họ.')) {
          const success = await deleteUser(id);
          if (success) {
              alert('Đã xóa thành công');
              fetchUsers(); // Load lại danh sách
          } else {
              alert('Lỗi khi xóa user (Hoặc bạn không đủ quyền)');
          }
      }
  };

  if(loading) return <div className="text-white p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div></div>;

  return (
    <div>
        <h1 className="text-2xl font-black text-white mb-6 border-l-4 border-red-600 pl-3">Quản Lý Người Dùng <span className="text-gray-500 text-lg font-normal">({users.length})</span></h1>
        
        <div className="bg-[#161616] rounded-xl border border-white/10 overflow-hidden shadow-lg">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-white/5 text-white uppercase font-bold text-xs">
                    <tr>
                        <th className="p-4">Người dùng</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Vai trò</th>
                        <th className="p-4">Ngày tham gia</th>
                        <th className="p-4 text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition">
                            <td className="p-4 font-bold text-white flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 border border-white/10">
                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><FaUser/></div>}
                                </div>
                                {user.username}
                                {user.id === currentUser.id && <span className="text-[10px] bg-green-600/20 text-green-500 px-1.5 rounded border border-green-600/30">YOU</span>}
                            </td>
                            <td className="p-4">{user.email}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${user.role === 'admin' ? 'bg-red-600/10 text-red-500 border-red-600/30' : 'bg-blue-600/10 text-blue-500 border-blue-600/30'}`}>
                                    {user.role.toUpperCase()}
                                </span>
                            </td>
                            <td className="p-4 text-xs">{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                            <td className="p-4 text-right">
                                {/* Không cho xóa chính mình và Admin khác */}
                                {user.id !== currentUser.id && user.role !== 'admin' && (
                                    <button 
                                        onClick={() => handleDelete(user.id)} 
                                        className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition"
                                        title="Xóa User"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Users;