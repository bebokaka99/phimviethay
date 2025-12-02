import React from 'react';

const UserAvatar = ({ user, className = "w-10 h-10", fontSize = "text-sm" }) => {
    // Lấy tên hiển thị (Ưu tiên fullname, nếu không có lấy username)
    const name = user?.fullname || user?.username || "?";
    
    // 1. Nếu có link ảnh -> Hiển thị ảnh
    if (user?.avatar && user.avatar.trim() !== "") {
        return (
            <img 
                src={user.avatar} 
                alt={name} 
                className={`${className} rounded-full object-cover border border-white/10 bg-gray-800`} 
                onError={(e) => {
                    // Nếu link ảnh bị lỗi (404), tự động ẩn ảnh đi để hiện chữ bên dưới (fallback)
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
            />
        );
    }

    // 2. Hàm tạo chữ cái viết tắt (VD: "Nguyen Van A" -> "NA")
    const getInitials = (n) => {
        const parts = n.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // 3. Hàm chọn màu nền cố định theo tên (Tên giống nhau -> Màu giống nhau)
    const getColor = (n) => {
        const colors = [
            'bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-600', 
            'bg-purple-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600',
            'bg-orange-600', 'bg-cyan-600'
        ];
        let hash = 0;
        for (let i = 0; i < n.length; i++) hash = n.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    // Render Avatar Chữ (Fallback nếu ảnh lỗi hoặc không có ảnh)
    return (
        <div 
            className={`${className} rounded-full flex items-center justify-center font-bold text-white border border-white/10 shadow-md ${getColor(name)}`}
            // Style này để đảm bảo nó ẩn đi nếu ảnh load thành công (logic onError ở trên)
            style={user?.avatar ? { display: 'none' } : {}}
        >
            <span className={fontSize}>{getInitials(name)}</span>
        </div>
    );
};

export default UserAvatar;