import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
// Import thêm icon FaIdCard, FaCheckCircle
import { FaArrowLeft, FaUser, FaEnvelope, FaLock, FaPlayCircle, FaIdCard, FaCheckCircle } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  
  // Thêm state fullname và confirmPassword
  const [formData, setFormData] = useState({ 
      fullname: '', 
      username: '', 
      email: '', 
      password: '',
      confirmPassword: '' 
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      // 1. Kiểm tra mật khẩu nhập lại
      if (formData.password !== formData.confirmPassword) {
          setError('Mật khẩu nhập lại không khớp!');
          return;
      }

      setLoading(true);

      try {
          // Gọi API (Lưu ý: Backend không cần confirmPassword nên ta không gửi field này lên)
          const { confirmPassword, ...dataToSend } = formData;
          
          await register(dataToSend);
          alert('🎉 Đăng ký thành công! Vui lòng đăng nhập.');
          navigate('/login');
      } catch (err) {
          setError(err);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans py-10">
        {/* Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 blur-sm scale-105 animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50"></div>

        <div className="relative z-10 w-full max-w-lg p-8 bg-black/60 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(229,9,20,0.2)] border border-white/10 animate-fade-in-up">
            <button onClick={() => navigate('/')} className="absolute top-5 left-5 text-gray-400 hover:text-white transition p-2 hover:bg-white/10 rounded-full">
                <FaArrowLeft />
            </button>

             <div className="text-center mb-8">
                 <h1 className="text-phim-accent text-3xl font-black tracking-tighter uppercase drop-shadow-md select-none inline-flex items-center gap-2">
                    <FaPlayCircle className="text-2xl" /> PhimViet<span className="text-white">Hay</span>
                </h1>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-wide">Đăng Ký Thành Viên</h2>

            {error && <div className="bg-red-600/20 text-red-400 p-4 rounded-lg text-sm mb-6 text-center border border-red-600/30 backdrop-blur-md flex items-center justify-center gap-2 animate-shake">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Fullname */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-phim-accent transition-colors">
                        <FaIdCard />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Tên hiển thị (VD: Nguyễn Văn A)"
                        required
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a]/80 text-white border border-white/10 focus:border-phim-accent focus:ring-2 focus:ring-phim-accent/30 transition-all outline-none placeholder-gray-500"
                        value={formData.fullname}
                        onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                    />
                </div>

                {/* 2. Username */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-phim-accent transition-colors">
                        <FaUser />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Tên đăng nhập (Viết liền không dấu)"
                        required
                        pattern="[a-zA-Z0-9_]+" // Chỉ cho phép chữ, số, gạch dưới
                        title="Chỉ bao gồm chữ cái, số và dấu gạch dưới"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a]/80 text-white border border-white/10 focus:border-phim-accent focus:ring-2 focus:ring-phim-accent/30 transition-all outline-none placeholder-gray-500"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                </div>

                {/* 3. Email */}
                <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-phim-accent transition-colors">
                        <FaEnvelope />
                    </div>
                    <input 
                        type="email" 
                        placeholder="Địa chỉ Email"
                        required
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a]/80 text-white border border-white/10 focus:border-phim-accent focus:ring-2 focus:ring-phim-accent/30 transition-all outline-none placeholder-gray-500"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                
                {/* 4. Password */}
                <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-phim-accent transition-colors">
                        <FaLock />
                    </div>
                    <input 
                        type="password" 
                        placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                        required
                        minLength={6}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a]/80 text-white border border-white/10 focus:border-phim-accent focus:ring-2 focus:ring-phim-accent/30 transition-all outline-none placeholder-gray-500"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                </div>

                {/* 5. Confirm Password */}
                <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-phim-accent transition-colors">
                        <FaCheckCircle />
                    </div>
                    <input 
                        type="password" 
                        placeholder="Nhập lại mật khẩu"
                        required
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a]/80 text-white border transition-all outline-none placeholder-gray-500 ${
                            formData.confirmPassword && formData.password !== formData.confirmPassword 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' 
                            : 'border-white/10 focus:border-phim-accent focus:ring-phim-accent/30'
                        }`}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                </div>
                
                <button 
                    disabled={loading}
                     className="w-full py-4 rounded-xl bg-gradient-to-r from-phim-accent to-red-700 text-white font-bold text-lg hover:from-red-700 hover:to-phim-accent transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 mt-4 relative overflow-hidden group"
                >
                    <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
                    <span className="relative z-10">{loading ? 'Đang xử lý...' : 'Đăng Ký Ngay'}</span>
                </button>
            </form>

            <div className="mt-6 text-gray-400 text-sm text-center">
                Đã có tài khoản? <span onClick={() => navigate('/login')} className="text-white hover:underline cursor-pointer font-bold ml-1 transition-colors hover:text-phim-accent">Đăng nhập ngay</span>.
            </div>
        </div>
    </div>
  );
};

export default Register;