import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
// Đổi icon Envelope thành User
import { FaArrowLeft, FaUser, FaLock, FaPlayCircle } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
          await login(formData);
          navigate('/');
          window.location.reload();
      } catch (err) {
          setError(err);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 blur-sm scale-105 animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40"></div>

        <div className="relative z-10 w-full max-w-md p-8 md:p-10 bg-black/60 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(229,9,20,0.2)] border border-white/10 animate-fade-in-up">
            
            <button onClick={() => navigate('/')} className="absolute top-5 left-5 text-gray-400 hover:text-white transition p-2 hover:bg-white/10 rounded-full">
                <FaArrowLeft />
            </button>

            <div className="text-center mb-8">
                 <h1 className="text-phim-accent text-3xl font-black tracking-tighter uppercase drop-shadow-md select-none inline-flex items-center gap-2">
                    <FaPlayCircle className="text-2xl" /> PhimViet<span className="text-white">Hay</span>
                </h1>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-wide">Đăng Nhập</h2>

            {error && <div className="bg-red-600/20 text-red-400 p-4 rounded-lg text-sm mb-6 text-center border border-red-600/30 backdrop-blur-md flex items-center justify-center gap-2 animate-shake">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* INPUT TÀI KHOẢN (Username hoặc Email) */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-phim-accent transition-colors">
                        <FaUser />
                    </div>
                    <input 
                        type="text" // Đổi thành text để nhập được username
                        placeholder="Email hoặc Tên đăng nhập" // Placeholder mới
                        required
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1a1a1a]/80 text-white border border-white/10 focus:border-phim-accent focus:ring-2 focus:ring-phim-accent/30 transition-all outline-none placeholder-gray-500"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                
                <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-phim-accent transition-colors">
                        <FaLock />
                    </div>
                    <input 
                        type="password" 
                        placeholder="Mật khẩu"
                        required
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1a1a1a]/80 text-white border border-white/10 focus:border-phim-accent focus:ring-2 focus:ring-phim-accent/30 transition-all outline-none placeholder-gray-500"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                </div>
                
                <button 
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-phim-accent to-red-700 text-white font-bold text-lg hover:from-red-700 hover:to-phim-accent transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 relative overflow-hidden group"
                >
                    <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
                    <span className="relative z-10">{loading ? 'Đang xử lý...' : 'Đăng Nhập Ngay'}</span>
                </button>
            </form>

            <div className="mt-8 text-gray-400 text-sm text-center">
                Bạn mới tham gia PhimVietHay? <span onClick={() => navigate('/register')} className="text-white hover:underline cursor-pointer font-bold ml-1 transition-colors hover:text-phim-accent">Đăng ký ngay</span>.
            </div>
        </div>
    </div>
  );
};

export default Login;