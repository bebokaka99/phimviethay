import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios'; // Cần axios để up ảnh
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import MovieCard from '../components/movies/MovieCard'; 
import UserAvatar from '../components/common/UserAvatar';
import { getFavorites, getCurrentUser, updateProfile, logout, toggleFavorite } from '../services/authService';
import { FaUserCircle, FaSave, FaSignOutAlt, FaCamera, FaLock, FaIdCard, FaHeart, FaTrashAlt, FaStar, FaExclamationTriangle, FaCloudUploadAlt, FaCheckCircle, FaImage, FaPen, FaTimes } from 'react-icons/fa';

// --- CẤU HÌNH CLOUDINARY ---
const CLOUD_NAME = 'dffwgj4x3';
const UPLOAD_PRESET = 'phimviethay_preset'; 

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
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  const [formData, setFormData] = useState({ fullname: '', avatar: '', newPassword: '', confirmPassword: '' });
  const [selectedFile, setSelectedFile] = useState(null); // State lưu file ảnh gốc để upload
  const fileInputRef = useRef(null);

  const fetchFavs = async () => {
      const data = await getFavorites();
      const mappedData = data.map(item => ({
          _id: item.id, 
          slug: item.movie_slug,
          name: item.movie_name,
          thumb_url: item.movie_thumb,
          quality: item.movie_quality || 'HD',
          year: item.movie_year || '2024',
          episode_current: item.episode_current || 'Full',
          vote_average: item.vote_average ? parseFloat(item.vote_average) : 0,
          origin_name: 'Đã lưu' 
      }));
      setFavorites(mappedData || []);
      setLoadingFavs(false);
  };

  useEffect(() => {
      if (!user) { navigate('/login'); return; }
      setFormData(prev => ({ ...prev, fullname: user.fullname, avatar: user.avatar }));
      fetchFavs();
  }, [user, navigate]);

  const requestDelete = (e, movie) => {
      e.stopPropagation();
      setMovieToDelete(movie);
      setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
      if (movieToDelete) {
          await toggleFavorite({ slug: movieToDelete.slug });
          fetchFavs();
          setShowDeleteModal(false);
          setMovieToDelete(null);
      }
  };

  // --- XỬ LÝ CHỌN ẢNH (PREVIEW) ---
  const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) { // Giới hạn 5MB
              alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");
              return;
          }
          // Tạo link tạm để preview
          const previewUrl = URL.createObjectURL(file);
          setFormData(prev => ({ ...prev, avatar: previewUrl }));
          setSelectedFile(file); // Lưu file gốc để tí nữa upload
      }
  };

  // --- HÀM UPLOAD LÊN CLOUDINARY ---
  const uploadImageToCloudinary = async (file) => {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET); 
      data.append("cloud_name", CLOUD_NAME);

      try {
          const res = await axios.post(
              `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
              data
          );
          return res.data.secure_url; // Trả về link ảnh online
      } catch (err) {
          console.error("Upload failed:", err);
          throw new Error("Lỗi khi tải ảnh lên máy chủ.");
      }
  };

  // --- XỬ LÝ LƯU (UPDATE PROFILE) ---
  const handleUpdate = async (e) => {
      e.preventDefault();
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) { alert('Mật khẩu nhập lại không khớp!'); return; }
      
      setIsSaving(true);
      try {
          let finalAvatarUrl = formData.avatar;

          // Nếu người dùng có chọn file mới -> Upload lên Cloudinary trước
          if (selectedFile) {
              finalAvatarUrl = await uploadImageToCloudinary(selectedFile);
          }

          const dataToSend = { 
              fullname: formData.fullname, 
              avatar: finalAvatarUrl, // Gửi link ảnh (URL) thay vì Base64
              ...(formData.newPassword && { password: formData.newPassword }) 
          };

          const res = await updateProfile(dataToSend);
          setUser(res.user); 
          setShowEdit(false); 
          setSelectedFile(null); // Reset file
          alert('Cập nhật hồ sơ thành công!');
      } catch (error) { 
          alert(error.message || error); 
      } finally { 
          setIsSaving(false); 
      }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-transparent text-white font-sans pb-20 selection:bg-red-600 selection:text-white">
      <Helmet><title>Hồ sơ của tôi | PhimVietHay</title></Helmet>
      <Header />

      {/* --- BANNER PROFILE --- */}
      <div className="relative h-[350px] md:h-[400px] group overflow-hidden mt-[-64px] md:mt-[-80px]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full container mx-auto px-4 md:px-12 pb-4 flex flex-col md:flex-row items-center md:items-end gap-6 z-10">
              <div className="relative group/avatar">
                  <div className="p-1 rounded-full bg-gradient-to-br from-red-600 to-purple-600 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                      <UserAvatar user={user} className="w-28 h-28 md:w-36 md:h-36 border-4 border-[#0a0e17] bg-[#0a0e17]" fontSize="text-4xl" />
                  </div>
                  <button onClick={() => { setActiveTab('avatar'); setShowEdit(true); }} className="absolute bottom-1 right-1 bg-[#222] text-white p-2.5 rounded-full shadow-lg border border-white/20 hover:bg-white hover:text-black transition transform hover:scale-110">
                      <FaCamera className="text-sm" />
                  </button>
              </div>
              <div className="flex-1 text-center md:text-left mb-2">
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-2xl mb-2">{user.fullname || user.username}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-300">
                      <span className="drop-shadow-md">@{user.username}</span>
                      <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                      <span className="drop-shadow-md">{user.email}</span>
                      {user.role === 'admin' && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold tracking-wider shadow-lg shadow-red-900/30">ADMIN</span>}
                  </div>
              </div>
              <div className="flex gap-3 mb-2">
                  <button onClick={() => { setActiveTab('info'); setShowEdit(true); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-bold py-2.5 px-6 rounded-full shadow-lg transition flex items-center gap-2"><FaPen className="text-xs" /> Chỉnh sửa</button>
                  <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-600/20 hover:bg-red-600 border border-red-600/50 text-red-500 hover:text-white font-bold py-2.5 px-4 rounded-full backdrop-blur-md transition flex items-center gap-2 transform active:scale-95 group/logout"><FaSignOutAlt className="group-hover/logout:rotate-180 transition-transform duration-300" /></button>
              </div>
          </div>
      </div>

      <div className="h-8"></div>

      <div className="container mx-auto px-4 md:px-12">
          <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FaHeart className="text-red-600" /> Tủ Phim Của Tôi
                  <span className="text-sm font-normal text-gray-500">({favorites.length})</span>
              </h2>
          </div>

          {loadingFavs ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600"></div></div>
          ) : favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-8">
                  {favorites.map((movie) => (
                      <div key={movie._id} className="relative group">
                          <MovieCard movie={movie} />
                          <div onClick={(e) => requestDelete(e, movie)} className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer" title="Xóa khỏi tủ">
                              <div className="bg-black/80 text-white hover:text-red-500 p-2 rounded-md backdrop-blur-md border border-white/10 shadow-xl transform hover:scale-110 transition"><FaTrashAlt size={12} /></div>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                  <FaHeart className="text-6xl mx-auto mb-4 text-gray-600 opacity-50"/>
                  <p className="text-xl font-bold text-gray-400">Tủ phim trống trơn</p>
                  <button onClick={() => navigate('/')} className="mt-6 bg-red-600 px-8 py-3 rounded-full font-bold hover:bg-red-700 transition text-white shadow-lg">Khám phá ngay</button>
              </div>
          )}
      </div>

      {/* MODAL XÓA */}
      {showDeleteModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#161616] border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center transform scale-100 transition-all">
                  <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20"><FaExclamationTriangle className="text-3xl text-red-500" /></div>
                  <h3 className="text-xl font-bold text-white mb-2">Xác nhận xóa?</h3>
                  <p className="text-gray-400 text-sm mb-6">Bạn có chắc chắn muốn xóa phim <span className="text-white font-bold">"{movieToDelete?.name}"</span> khỏi tủ phim không?</p>
                  <div className="flex gap-3">
                      <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition">Hủy bỏ</button>
                      <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-lg shadow-red-900/20">Xóa ngay</button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL SỬA */}
      {showEdit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
             <div className="bg-[#0a0a0a] w-full max-w-4xl h-[650px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
                 <button onClick={() => setShowEdit(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white z-50"><FaTimes size={20}/></button>
                  <div className="w-full md:w-72 bg-black/40 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col">
                      <div className="mb-8"><h3 className="text-xl font-bold text-white">Cài đặt tài khoản</h3></div>
                      <div className="space-y-2 flex-1">
                          <button onClick={() => setActiveTab('info')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition flex items-center gap-3 ${activeTab === 'info' ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><FaIdCard /> Thông tin chung</button>
                          <button onClick={() => setActiveTab('avatar')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition flex items-center gap-3 ${activeTab === 'avatar' ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><FaImage /> Ảnh đại diện</button>
                          <button onClick={() => setActiveTab('password')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition flex items-center gap-3 ${activeTab === 'password' ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><FaLock /> Bảo mật</button>
                      </div>
                  </div>
                  <div className="flex-1 bg-transparent relative flex flex-col">
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                          <form onSubmit={handleUpdate} id="profile-form">
                              {activeTab === 'info' && (
                                  <div className="space-y-6 animate-fade-in">
                                      <h2 className="text-2xl font-bold text-white mb-2">Thông tin chung</h2>
                                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tên hiển thị</label><input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:border-red-600 outline-none transition font-medium" value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})} /></div>
                                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label><input type="text" disabled className="w-full bg-black/40 border border-transparent rounded-xl py-4 px-5 text-gray-500 cursor-not-allowed" value={user.email} /></div>
                                  </div>
                              )}
                              {activeTab === 'avatar' && (
                                  <div className="space-y-6 animate-fade-in">
                                      <h2 className="text-2xl font-bold text-white mb-2">Ảnh đại diện</h2>
                                      <div className="flex items-center gap-6 mb-8">
                                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-600 bg-black shadow-xl">
                                              {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover"/> : <UserAvatar user={{fullname: formData.fullname}} className="w-full h-full" />}
                                          </div>
                                          <div onClick={() => fileInputRef.current.click()} className="flex-1 border-2 border-dashed border-white/20 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 hover:bg-red-600/5 transition group"><FaCloudUploadAlt className="text-2xl text-gray-400 group-hover:text-red-500 mb-1" /><p className="text-xs text-gray-300 font-bold">Tải ảnh lên (Max 5MB)</p><input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} /></div>
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-gray-500 uppercase mb-3">Nhân vật mẫu:</p>
                                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                              {PRESET_AVATARS.map((char, idx) => (
                                                  <div key={idx} onClick={() => {setFormData({...formData, avatar: char.url}); setSelectedFile(null);}} className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition group ${formData.avatar === char.url ? 'border-red-600 scale-105 shadow-lg shadow-red-900/40' : 'border-transparent hover:border-white/30'}`}>
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
                                          <input type="password" placeholder="Mật khẩu mới" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:border-red-600 outline-none transition" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} />
                                          <input type="password" placeholder="Nhập lại mật khẩu mới" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:border-red-600 outline-none transition" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                                      </div>
                                  </div>
                              )}
                          </form>
                      </div>
                      <div className="p-6 border-t border-white/10 flex justify-end bg-black/20">
                          <button onClick={handleUpdate} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-red-900/20 transition flex items-center gap-2 disabled:opacity-50">{isSaving ? (
                              <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang lưu...
                              </>
                          ) : <><FaSave /> Lưu Thay Đổi</>}</button>
                      </div>
                  </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default Profile;