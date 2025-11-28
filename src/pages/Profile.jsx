import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { getFavorites, getCurrentUser, updateProfile, logout, toggleFavorite } from '../services/authService';
import { FaUserCircle, FaSave, FaSignOutAlt, FaCamera, FaLock, FaIdCard, FaHeart, FaPlayCircle, FaTimes, FaCloudUploadAlt, FaImage, FaUserEdit, FaFilm, FaCheckCircle, FaTrashAlt, FaStar } from 'react-icons/fa';

// --- KHO AVATAR ---
const PRESET_AVATARS = [
    { name: 'Luffy', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Luffy' },
    { name: 'Natra', url: 'https://api.dicebear.com/9.x/micah/svg?seed=Natra' },
    { name: 'Iron Man', url: 'https://api.dicebear.com/9.x/bottts/svg?seed=IronMan' },
    { name: 'Batman', url: 'https://api.dicebear.com/9.x/bottts/svg?seed=Batman' },
    { name: 'Cool Boy', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix' },
    { name: 'Cool Girl', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka' },
    { name: 'Cyberpunk', url: 'https://api.dicebear.com/9.x/identicon/svg?seed=Cyber' },
    { name: 'Cat', url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Cat' },
];

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [favorites, setFavorites] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(true);
  
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
      fullname: '',
      avatar: '',
      newPassword: '',
      confirmPassword: ''
  });
  
  const fileInputRef = useRef(null);

  // Load Data
  const fetchFavs = async () => {
      const data = await getFavorites();
      setFavorites(data || []);
      setLoadingFavs(false);
  };

  useEffect(() => {
      if (!user) { navigate('/login'); return; }
      setFormData(prev => ({ ...prev, fullname: user.fullname, avatar: user.avatar }));
      fetchFavs();
  }, [user, navigate]);

  // Xử lý xóa phim khỏi tủ
  const handleRemoveFav = async (e, movie) => {
      e.stopPropagation(); 
      if (window.confirm(`Bạn muốn xóa phim "${movie.movie_name}" khỏi tủ?`)) {
          await toggleFavorite({ slug: movie.movie_slug });
          fetchFavs(); 
      }
  };

  const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          if (file.size > 2 * 1024 * 1024) { 
              alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({ ...prev, avatar: reader.result }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleUpdate = async (e) => {
      e.preventDefault();
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
          alert('Mật khẩu nhập lại không khớp!');
          return;
      }

      setIsSaving(true);
      try {
          const dataToSend = {
              fullname: formData.fullname,
              avatar: formData.avatar,
              ...(formData.newPassword && { password: formData.newPassword })
          };

          const res = await updateProfile(dataToSend);
          setUser(res.user); 
          setShowEdit(false); 
          alert('Cập nhật hồ sơ thành công!');
      } catch (error) {
          alert(error);
      } finally {
          setIsSaving(false);
      }
  };

  if (!user) return null;

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans pb-20 selection:bg-red-600 selection:text-white">
      <Header />

      {/* --- BANNER PROFILE --- */}
      <div className="relative h-[300px] overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110 transition-all duration-1000"
            style={{ backgroundImage: `url(${user.avatar})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/40 via-[#0a0a0a]/80 to-[#0a0a0a]" />
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 w-full container mx-auto px-4 md:px-12 pb-10 flex items-end gap-6 z-10 translate-y-10">
              {/* Avatar */}
              <div className="relative group/avatar">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-br from-red-600 to-purple-600 shadow-2xl shadow-red-900/50">
                      <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0a0a0a] bg-black">
                          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                  </div>
                  <button 
                    onClick={() => { setActiveTab('avatar'); setShowEdit(true); }}
                    className="absolute bottom-1 right-1 bg-[#222] text-white p-2.5 rounded-full shadow-lg border border-white/20 hover:bg-white hover:text-black transition transform hover:scale-110"
                  >
                      <FaCamera className="text-sm" />
                  </button>
              </div>

              {/* Info */}
              <div className="flex-1 pb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-lg mb-2">{user.fullname || user.username}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-gray-400 font-medium">@{user.username}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-yellow-500 font-bold flex items-center gap-1"><FaStar /> VIP Member</span>
                  </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex gap-3 pb-4">
                  <button onClick={() => { setActiveTab('info'); setShowEdit(true); }} className="bg-white/10 text-white font-bold py-2 px-5 rounded-lg hover:bg-white/20 transition border border-white/10 flex items-center gap-2 text-sm">
                      <FaUserEdit /> Chỉnh sửa
                  </button>
                  <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-600/10 text-red-500 border border-red-600/30 font-bold py-2 px-4 rounded-lg hover:bg-red-600 hover:text-white transition text-sm">
                      <FaSignOutAlt />
                  </button>
              </div>
          </div>
      </div>

      <div className="h-16 md:h-16"></div>

      {/* Mobile Actions */}
      <div className="md:hidden px-4 flex gap-3 mb-8">
           <button onClick={() => { setActiveTab('info'); setShowEdit(true); }} className="flex-1 bg-[#222] text-white font-bold py-2.5 rounded-lg border border-white/10 flex justify-center items-center gap-2 text-sm">
              <FaUserEdit /> Chỉnh sửa
           </button>
           <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-900/20 text-red-500 border border-red-500/50 px-4 rounded-lg">
              <FaSignOutAlt />
           </button>
      </div>

      <div className="container mx-auto px-4 md:px-12">
          {/* --- TỦ PHIM --- */}
          <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">Tủ Phim Của Tôi</h2>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">{favorites.length}</span>
          </div>

          {loadingFavs ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600"></div></div>
          ) : favorites.length > 0 ? (
              
              // --- GRID PHIM (STYLE GIỐNG CATALOG/HOME) ---
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-8">
                  {favorites.map((movie) => (
                      <div 
                        key={movie.id} 
                        className="relative group cursor-pointer select-none"
                        onClick={() => navigate(`/phim/${movie.movie_slug}`)}
                      >
                          {/* Card Image */}
                          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-gray-900 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg group-hover:shadow-red-900/20 ring-1 ring-white/10 group-hover:ring-red-600">
                              <img src={movie.movie_thumb} alt={movie.movie_name} className="w-full h-full object-cover transform group-hover:brightness-75 transition-all duration-500" loading="lazy" />
                              
                              {/* Badge HD (Giả lập vì DB chưa có) */}
                              <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">HD</div>

                              {/* Nút Xóa Nhanh (Thay cho Rating) */}
                              <div 
                                onClick={(e) => handleRemoveFav(e, movie)}
                                className="absolute top-2 right-2 bg-black/60 text-gray-300 p-1.5 rounded-md hover:bg-red-600 hover:text-white transition z-20"
                                title="Xóa khỏi tủ phim"
                              >
                                  <FaTrashAlt size={10} />
                              </div>
                              
                              {/* Badge Saved */}
                              <div className="absolute bottom-2 right-2 z-10">
                                  <span className="bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded border border-white/10">Đã lưu</span>
                              </div>

                              {/* Nút Play */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                                  <FaPlayCircle className="text-4xl text-white drop-shadow-xl" />
                              </div>
                          </div>
                          
                          {/* Info */}
                          <div className="px-1">
                              <h3 className="font-bold text-sm text-gray-200 line-clamp-1 group-hover:text-red-600 transition-colors">{movie.movie_name}</h3>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-800 rounded-2xl bg-white/5">
                  <FaHeart className="text-5xl mx-auto mb-3 text-gray-700"/>
                  <p className="text-lg text-gray-400 font-bold">Chưa có phim nào trong tủ.</p>
                  <button onClick={() => navigate('/')} className="mt-4 text-red-500 hover:underline font-bold text-sm">Khám phá ngay</button>
              </div>
          )}
      </div>

      {/* --- MODAL CHỈNH SỬA (GIỮ NGUYÊN) --- */}
      {showEdit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
              <div className="bg-[#111] w-full max-w-4xl h-[650px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row">
                  <div className="w-full md:w-72 bg-[#0f0f0f] border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col">
                      <div className="mb-8">
                          <h3 className="text-xl font-bold text-white">Cài đặt tài khoản</h3>
                          <p className="text-xs text-gray-500">Quản lý thông tin cá nhân</p>
                      </div>
                      <div className="space-y-2 flex-1">
                          <button onClick={() => setActiveTab('info')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition flex items-center gap-3 ${activeTab === 'info' ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><FaIdCard /> Thông tin chung</button>
                          <button onClick={() => setActiveTab('avatar')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition flex items-center gap-3 ${activeTab === 'avatar' ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><FaImage /> Ảnh đại diện</button>
                          <button onClick={() => setActiveTab('password')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition flex items-center gap-3 ${activeTab === 'password' ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><FaLock /> Bảo mật</button>
                      </div>
                      <button onClick={() => setShowEdit(false)} className="mt-auto w-full py-3 rounded-xl font-bold text-sm text-gray-400 hover:bg-white/5 hover:text-white transition border border-white/10">Đóng</button>
                  </div>
                  <div className="flex-1 bg-[#0a0a0a] relative flex flex-col">
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                          <form onSubmit={handleUpdate} id="profile-form">
                              {activeTab === 'info' && (
                                  <div className="space-y-6 animate-fade-in">
                                      <h2 className="text-2xl font-bold text-white mb-2">Thông tin chung</h2>
                                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tên hiển thị</label><input type="text" className="w-full bg-[#161616] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-red-600 outline-none transition font-medium" value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})} /></div>
                                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label><input type="text" disabled className="w-full bg-[#161616]/50 border border-transparent rounded-xl py-4 px-5 text-gray-500 cursor-not-allowed" value={user.email} /></div>
                                  </div>
                              )}
                              {activeTab === 'avatar' && (
                                  <div className="space-y-6 animate-fade-in">
                                      <h2 className="text-2xl font-bold text-white mb-2">Ảnh đại diện</h2>
                                      <div className="flex items-center gap-6 mb-8">
                                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-600 bg-black shadow-xl"><img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" /></div>
                                          <div onClick={() => fileInputRef.current.click()} className="flex-1 border-2 border-dashed border-white/20 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 hover:bg-red-600/5 transition group">
                                              <FaCloudUploadAlt className="text-2xl text-gray-400 group-hover:text-red-500 mb-1" /><p className="text-xs text-gray-300 font-bold">Tải ảnh lên</p><input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                          </div>
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-gray-500 uppercase mb-3">Nhân vật mẫu:</p>
                                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                              {PRESET_AVATARS.map((char, idx) => (
                                                  <div key={idx} onClick={() => setFormData({...formData, avatar: char.url})} className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition group ${formData.avatar === char.url ? 'border-red-600 scale-105 shadow-lg shadow-red-900/40' : 'border-transparent hover:border-white/30'}`}>
                                                      <img src={char.url} alt={char.name} className="w-full h-full object-cover" />
                                                      {formData.avatar === char.url && <div className="absolute top-1 right-1 bg-red-600 rounded-full p-0.5"><FaCheckCircle size={10} /></div>}
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              )}
                              {activeTab === 'password' && (
                                  <div className="space-y-6 animate-fade-in">
                                      <h2 className="text-2xl font-bold text-white mb-2">Bảo mật</h2>
                                      <div className="space-y-4">
                                          <input type="password" placeholder="Mật khẩu mới" className="w-full bg-[#161616] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-red-600 outline-none transition" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} />
                                          <input type="password" placeholder="Nhập lại mật khẩu mới" className="w-full bg-[#161616] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-red-600 outline-none transition" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                                      </div>
                                  </div>
                              )}
                          </form>
                      </div>
                      <div className="p-6 border-t border-white/10 flex justify-end bg-[#111]">
                          <button onClick={handleUpdate} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-red-900/20 transition flex items-center gap-2 disabled:opacity-50">{isSaving ? 'Đang lưu...' : <><FaSave /> Lưu Thay Đổi</>}</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Profile;