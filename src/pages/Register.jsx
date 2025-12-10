import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, getCurrentUser } from '../services/authService'; // Thêm getCurrentUser
import { FaArrowLeft, FaUser, FaEnvelope, FaLock, FaIdCard, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import LogoImg from '../assets/logo.png';

// --- TOAST COMPONENT (GIỮ NGUYÊN) ---
const Toast = ({ type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === 'success';

    return (
        <div className={`
            fixed top-6 right-6 z-[200] 
            flex items-center gap-4 
            px-6 py-4 rounded-xl border-l-4 
            backdrop-blur-md animate-fade-in-down transition-all shadow-2xl
            ${isSuccess 
                ? 'bg-green-900/90 text-white border-green-500 shadow-green-900/30' 
                : 'bg-red-900/90 text-white border-red-600 shadow-red-900/30'}
        `}>
            <div className={`p-1 rounded-full ${isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {isSuccess ? <FaCheckCircle className="text-xl text-green-400" /> : <FaExclamationCircle className="text-xl text-red-400" />}
            </div>
            <div>
                <h4 className={`font-bold text-sm uppercase tracking-wider ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                    {isSuccess ? 'Thành công' : 'Thông báo'}
                </h4>
                <p className="text-xs opacity-90 mt-0.5 text-gray-100">{message}</p>
            </div>
            <button onClick={onClose} className="ml-2 text-white/50 hover:text-white transition">
                <FaTimes />
            </button>
        </div>
    );
};

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
      fullname: '', 
      username: '', 
      email: '', 
      password: '',
      confirmPassword: '' 
  });
  
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- LOGIC MỚI: Redirect nếu đã đăng nhập ---
  useEffect(() => {
      const user = getCurrentUser();
      if (user) {
          navigate('/'); // Đá về trang chủ nếu đã có session
      }
  }, [navigate]);
  // -------------------------------------------

  const handleSubmit = async (e) => {
      e.preventDefault();
      setToast(null);

      if (formData.password !== formData.confirmPassword) {
          setToast({ type: 'error', message: 'Mật khẩu nhập lại không khớp!' });
          return;
      }

      setLoading(true);

      try {
          const { confirmPassword, ...dataToSend } = formData;
          await register(dataToSend);
          setToast({ type: 'success', message: 'Đăng ký thành công! Đang chuyển hướng...' });
          setTimeout(() => navigate('/login'), 1500);
      } catch (err) {
          setToast({ type: 'error', message: err.toString() });
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans py-10">
        {/* Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 blur-sm scale-105 animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50"></div>

        {/* HIỂN THỊ TOAST */}
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        <div className="relative z-10 w-full max-w-lg p-8 bg-black/60 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(229,9,20,0.2)] border border-white/10 animate-fade-in-up">
            <button onClick={() => navigate('/')} className="absolute top-5 left-5 text-gray-400 hover:text-white transition p-2 hover:bg-white/10 rounded-full">
                <FaArrowLeft />
            </button>

             {/* --- PHẦN LOGO --- */}
             <div className="text-center mb-8 flex justify-center">
                 <img 
                    src={LogoImg} 
                    alt="PhimVietHay Logo" 
                    className="h-16 md:h-20 object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300" 
                 />
            </div>
            {/* ---------------------- */}

            <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-wide">Đăng Ký Thành Viên</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-phim-accent transition-colors"><FaIdCard /></div>
                    <input type="text" placeholder="Tên hiển thị (VD: Nguyễn Văn A)" required className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a]/80 text-white border border-white/10 focus:border-phim-accent focus:ring-2 focus:ring-phim-accent/30 transition-all outline-none placeholder-gray-500" value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})}/>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-phim-accent transition-colors"><FaUser /></div>
                    <input type="text" placeholder="Tên đăng nhập (Viết liền không dấu)" required pattern="[a-zA-Z0-9_]+" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a]/80 text-white border border-white/10 focus:border-phim-accent focus:ring-2 focus:ring-phim-accent/30 transition-all outline-none placeholder-gray-500" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}/>
                </div>

                <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-phim-accent transition-colors"><FaEnvelope /></div>
                    <input type="email" placeholder="Địa chỉ Email" required className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a]/80 text-white border border-white/10 focus:border-phim-accent focus:ring-2 focus:ring-phim-accent/30 transition-all outline-none placeholder-gray-500" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}/>
                </div>
                
                <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-phim-accent transition-colors"><FaLock /></div>
                    <input type="password" placeholder="Mật khẩu (tối thiểu 6 ký tự)" required minLength={6} className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a]/80 text-white border border-white/10 focus:border-phim-accent focus:ring-2 focus:ring-phim-accent/30 transition-all outline-none placeholder-gray-500" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}/>
                </div>

                <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-phim-accent transition-colors"><FaCheckCircle /></div>
                    <input type="password" placeholder="Nhập lại mật khẩu" required className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a]/80 text-white border border-white/10 focus:border-phim-accent focus:ring-2 focus:ring-phim-accent/30 transition-all outline-none placeholder-gray-500" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}/>
                </div>

                <button disabled={loading} className="w-full py-3.5 rounded-xl bg-phim-accent text-white font-bold text-lg hover:bg-red-700 transition-all transform active:scale-95 shadow-lg shadow-red-900/30 mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? 'Đang xử lý...' : 'Đăng Ký Ngay'}
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