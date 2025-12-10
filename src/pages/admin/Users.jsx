import React, { useEffect, useState } from 'react';
import { FaTrashAlt, FaCrown, FaArrowUp, FaArrowDown, FaBan, FaUnlock, FaClock, FaUser, FaSearch, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { getAllUsers, deleteUser, updateUserRole, banUser } from '../../services/adminService';
import { getCurrentUser } from '../../services/authService';
import { useDebounce } from '../../hooks/useDebounce'; // Sử dụng hook có sẵn của bạn

// --- COMPONENT MODAL BAN ---
const BanModal = ({ isOpen, onClose, onConfirm, username }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-96 shadow-2xl transform scale-100 transition-all">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <FaBan className="text-red-500" /> Cấm tài khoản
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                    Chọn thời gian cấm đối với user <span className="text-white font-bold">{username}</span>:
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {[1, 3, 7, 30].map(day => (
                        <button key={day} onClick={() => onConfirm(day)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-2 rounded-lg text-sm font-bold transition">
                            {day} Ngày
                        </button>
                    ))}
                    <button onClick={() => onConfirm(36500)} className="col-span-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-500 py-2 rounded-lg text-sm font-bold transition">
                        VĨNH VIỄN (100 Năm)
                    </button>
                </div>

                <button onClick={onClose} className="w-full py-2 bg-transparent text-gray-500 hover:text-white text-sm font-bold">
                    Hủy bỏ
                </button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    
    // Search & Filter State
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    // Modal State
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const currentUser = getCurrentUser();
    const isSuperAdmin = currentUser?.role === 'super_admin';

    // Fetch Data
    const fetchUsers = async () => {
        setLoading(true);
        const res = await getAllUsers(page, debouncedSearch);
        if (res.data) {
            setUsers(res.data);
            setPagination(res.pagination);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [page, debouncedSearch]);

    // Helpers
    const getRemainingTime = (dateString) => {
        if (!dateString) return null;
        const end = new Date(dateString).getTime();
        const now = new Date().getTime();
        
        if (end <= now) return null; // Đã hết hạn

        const distance = end - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 365) return "Vĩnh viễn";
        if (days > 0) return `${days} ngày ${hours} giờ`;
        return `${hours} giờ`;
    };

    // Actions
    const openBanModal = (user) => {
        setSelectedUser(user);
        setIsBanModalOpen(true);
    };

    const handleConfirmBan = async (days) => {
        setIsBanModalOpen(false);
        if (selectedUser) {
            const success = await banUser(selectedUser.id, days);
            if (success) fetchUsers();
        }
    };

    const handleUnban = async (user) => {
        if (confirm(`Mở khóa ngay cho ${user.username}?`)) {
            const success = await banUser(user.id, 0);
            if (success) fetchUsers();
        }
    };

    const handleDelete = async (id) => {
        if(confirm('Xóa vĩnh viễn user này?')) {
            if(await deleteUser(id)) fetchUsers();
        }
    };

    const handleRoleChange = async (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (confirm(`Đổi quyền ${user.username} thành ${newRole.toUpperCase()}?`)) {
            if(await updateUserRole(user.id, newRole)) fetchUsers();
        }
    };

    return (
        <div>
            {/* Header Toolset */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-black text-white border-l-4 border-red-600 pl-3">
                    Quản Lý Người Dùng 
                    <span className="text-gray-500 text-lg font-normal ml-2">({pagination.totalItems || 0})</span>
                </h1>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Tìm username, email..." 
                        className="w-full bg-[#111] border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-red-600 focus:outline-none transition"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    <FaSearch className="absolute left-3 top-2.5 text-gray-500 text-xs" />
                    {search && (
                        <FaTimes 
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-white cursor-pointer text-xs" 
                            onClick={() => { setSearch(''); setPage(1); }}
                        />
                    )}
                </div>
            </div>
            
            {/* Table */}
            <div className="bg-[#161616] rounded-xl border border-white/10 overflow-hidden shadow-lg min-h-[400px]">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-white uppercase font-bold text-xs">
                        <tr>
                            <th className="p-4">User Info</th>
                            <th className="p-4 text-center">Vai trò</th>
                            <th className="p-4 text-center">Trạng thái</th>
                            <th className="p-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="4" className="p-10 text-center">Đang tải dữ liệu...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="4" className="p-10 text-center">Không tìm thấy user nào.</td></tr>
                        ) : (
                            users.map((user) => {
                                const remaining = getRemainingTime(user.banned_until);
                                const isBanned = remaining !== null;

                                return (
                                <tr key={user.id} className={`transition group ${isBanned ? 'bg-red-950/10' : 'hover:bg-white/5'}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-800 border border-white/10">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><FaUser/></div>}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white flex items-center gap-2">
                                                    {user.username}
                                                    {user.id === currentUser.id && <span className="text-[9px] text-green-500 border border-green-500 px-1 rounded">YOU</span>}
                                                </div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="p-4 text-center">
                                        {user.role === 'super_admin' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">
                                                <FaCrown /> SUPER ADMIN
                                            </span>
                                        ) : user.role === 'admin' ? (
                                            <span className="inline-block px-2 py-1 rounded text-[10px] font-bold bg-red-600/10 text-red-500 border border-red-600/30">ADMIN</span>
                                        ) : (
                                            <span className="inline-block px-2 py-1 rounded text-[10px] font-bold bg-blue-600/10 text-blue-500 border border-blue-600/30">USER</span>
                                        )}
                                    </td>

                                    <td className="p-4 text-center">
                                        {isBanned ? (
                                            <div className="inline-flex items-center gap-1.5 text-red-400 bg-red-950/40 px-2 py-1 rounded border border-red-500/20 text-xs font-bold animate-pulse">
                                                <FaClock /> {remaining}
                                            </div>
                                        ) : (
                                            <span className="text-green-500 text-xs font-bold">● Hoạt động</span>
                                        )}
                                    </td>

                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            {/* Ban/Unban */}
                                            {user.id !== currentUser.id && (isSuperAdmin || user.role === 'user') && (
                                                isBanned ? (
                                                    <button onClick={() => handleUnban(user)} className="p-2 text-green-400 hover:bg-green-500/10 rounded transition" title="Mở khóa"><FaUnlock /></button>
                                                ) : (
                                                    <button onClick={() => openBanModal(user)} className="p-2 text-orange-400 hover:bg-orange-500/10 rounded transition" title="Cấm user"><FaBan /></button>
                                                )
                                            )}

                                            {/* Roles */}
                                            {isSuperAdmin && user.role !== 'super_admin' && (
                                                <button onClick={() => handleRoleChange(user)} className={`p-2 rounded transition ${user.role === 'user' ? 'text-blue-400 hover:bg-blue-500/10' : 'text-yellow-400 hover:bg-yellow-500/10'}`} title="Đổi quyền">
                                                    {user.role === 'user' ? <FaArrowUp /> : <FaArrowDown />}
                                                </button>
                                            )}

                                            {/* Delete */}
                                            {user.role !== 'super_admin' && (isSuperAdmin || (user.role !== 'admin' && user.id !== currentUser.id)) && (
                                                <button onClick={() => handleDelete(user.id)} className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded transition" title="Xóa"><FaTrashAlt /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition text-white"
                    >
                        <FaChevronLeft />
                    </button>
                    <span className="flex items-center px-4 bg-white/5 rounded-lg text-sm font-bold text-gray-300">
                        Trang {page} / {pagination.totalPages}
                    </span>
                    <button 
                        disabled={page === pagination.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition text-white"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            )}

            {/* Ban Modal Inject */}
            <BanModal 
                isOpen={isBanModalOpen} 
                onClose={() => setIsBanModalOpen(false)} 
                onConfirm={handleConfirmBan}
                username={selectedUser?.username}
            />
        </div>
    );
};

export default Users;