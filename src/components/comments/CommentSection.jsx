import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComments, addComment, deleteComment, toggleLikeComment } from '../../services/commentService';
import { getCurrentUser } from '../../services/authService';
import { FaPaperPlane, FaTrashAlt, FaUserCircle, FaComments, FaThumbsUp, FaReply, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Hàm tính thời gian
const timeAgo = (dateString) => {
    if (!dateString) return '';
    let dateStr = String(dateString);
    if (!dateStr.includes('Z') && !dateStr.includes('+')) dateStr += 'Z';
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    let adjustedSeconds = seconds;
    if (adjustedSeconds > 21000 && adjustedSeconds < 29000) adjustedSeconds -= 25200;

    if (adjustedSeconds < 60) return 'Vừa xong';
    const minutes = Math.floor(adjustedSeconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};

const CommentSection = ({ movieSlug, episodeSlug }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  
  const [replyTo, setReplyTo] = useState(null); 
  const [openReplies, setOpenReplies] = useState({}); 

  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { if (movieSlug) loadComments(); }, [movieSlug, episodeSlug]);

  const loadComments = async () => {
      const data = await getComments(movieSlug, episodeSlug);
      setComments(data);
  };

  const toggleReplyVisibility = (commentId) => {
      setOpenReplies(prev => ({
          ...prev,
          [commentId]: !prev[commentId]
      }));
  };

  const handleSubmit = async (e, parentId = null) => {
      e.preventDefault();
      if (!user) { navigate('/login'); return; }
      const textToSend = parentId ? replyContent : content;
      if (!textToSend.trim()) return;

      setLoading(true);
      try {
          const payload = { movieSlug, episodeSlug: episodeSlug || null, content: textToSend, parentId: parentId };
          const newComments = await addComment(payload);
          setComments(newComments);
          
          if (parentId) { 
              setReplyTo(null); 
              setReplyContent('');
              setOpenReplies(prev => ({...prev, [parentId]: true}));
          } else { 
              setContent(''); 
          }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
  };

  const handleLike = async (commentId) => {
      if (!user) { navigate('/login'); return; }
      setComments(prev => prev.map(c => {
          if (c.id === commentId) {
              return { ...c, is_liked: !c.is_liked, like_count: c.is_liked ? c.like_count - 1 : c.like_count + 1 };
          }
          return c;
      }));
      await toggleLikeComment(commentId);
  };

  const handleDelete = async (id) => {
      if (window.confirm('Xóa bình luận này?')) {
          await deleteComment(id);
          loadComments();
      }
  };

  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const CommentItem = ({ cmt, isReply = false }) => {
      const replies = !isReply ? getReplies(cmt.id) : [];
      const isRepliesOpen = openReplies[cmt.id];

      return (
          <div className={`flex gap-3 group ${isReply ? 'mt-4' : 'mt-6'}`}>
              <div className={`flex-shrink-0 ${isReply ? 'w-6 h-6' : 'w-10 h-10'} rounded-full overflow-hidden border border-white/10 bg-gray-800`}>
                   <img src={cmt.avatar} alt={cmt.username} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold text-white ${isReply ? 'text-xs' : 'text-sm'} cursor-pointer hover:underline`}>
                          {cmt.fullname || cmt.username}
                      </span>
                      
                      {/* --- SỬA ĐOẠN NÀY: HIỂN THỊ ADMIN --- */}
                      {cmt.role === 'admin' && (
                          <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider border border-red-500/50 shadow-sm">
                              ADMIN
                          </span>
                      )}
                      {/* ------------------------------------- */}

                      <span className="text-[11px] text-gray-400">{timeAgo(cmt.created_at)}</span>
                  </div>

                  <div className={`text-gray-300 leading-relaxed whitespace-pre-wrap ${isReply ? 'text-xs' : 'text-sm'}`}>
                        {cmt.content.split(' ').map((word, i) => 
                            word.startsWith('@') ? <span key={i} className="text-blue-400 hover:underline cursor-pointer mr-1">{word}</span> : word + ' '
                        )}
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                      <button onClick={() => handleLike(cmt.id)} className={`flex items-center gap-1.5 text-xs font-bold transition ${cmt.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
                          <FaThumbsUp /> {cmt.like_count > 0 && cmt.like_count}
                      </button>
                      {!isReply && (
                          <button onClick={() => setReplyTo(replyTo === cmt.id ? null : cmt.id)} className="text-xs font-bold text-gray-400 hover:text-white transition px-2 py-1 rounded-full hover:bg-white/10">
                              Phản hồi
                          </button>
                      )}
                      {(user?.id === cmt.user_id || user?.role === 'admin') && (
                          <button onClick={() => handleDelete(cmt.id)} className="text-xs font-bold text-gray-400 hover:text-red-500 transition ml-auto opacity-0 group-hover:opacity-100">
                              Xóa
                          </button>
                      )}
                  </div>

                  {replyTo === cmt.id && (
                      <form onSubmit={(e) => handleSubmit(e, cmt.id)} className="mt-3 flex gap-3 animate-fade-in items-start">
                           <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 flex-shrink-0"><img src={user?.avatar} className="w-full h-full object-cover" /></div>
                          <div className="flex-1 relative">
                              <input autoFocus type="text" className="w-full bg-transparent border-b border-white/20 py-1 px-2 text-sm text-white focus:border-white outline-none transition-colors placeholder-gray-500" placeholder="Thêm phản hồi công khai..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
                              <div className="flex justify-end gap-2 mt-2">
                                  <button type="button" onClick={() => setReplyTo(null)} className="text-xs font-bold text-white hover:bg-white/10 px-3 py-1.5 rounded-full">Hủy</button>
                                  <button disabled={!replyContent.trim()} className="text-xs font-bold bg-[#3ea6ff] text-black px-3 py-1.5 rounded-full hover:bg-[#65b8ff] disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-400">Phản hồi</button>
                              </div>
                          </div>
                      </form>
                  )}

                  {!isReply && replies.length > 0 && (
                      <div className="mt-2">
                          <button onClick={() => toggleReplyVisibility(cmt.id)} className="flex items-center gap-2 text-blue-400 hover:bg-blue-400/10 px-3 py-1.5 rounded-full text-xs font-bold transition">
                              {isRepliesOpen ? <FaChevronUp /> : <FaChevronDown />}
                              {isRepliesOpen ? 'Ẩn phản hồi' : `${replies.length} phản hồi`}
                          </button>
                          {isRepliesOpen && (
                              <div className="mt-2 animate-fade-in">
                                  {replies.map(reply => (<CommentItem key={reply.id} cmt={reply} isReply={true} />))}
                              </div>
                          )}
                      </div>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="mt-10 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-bold text-white">Bình luận <span className="text-gray-400 text-lg font-normal">{comments.length}</span></h3>
        </div>

        <div className="flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-gray-800">
                {user ? <img src={user.avatar} alt="Me" className="w-full h-full object-cover" /> : <FaUserCircle className="w-full h-full text-gray-500 p-1" />}
            </div>
            <form onSubmit={(e) => handleSubmit(e, null)} className="flex-1">
                <div className="relative group">
                    <textarea 
                        className="w-full bg-transparent border-b border-white/20 text-white placeholder-gray-500 focus:border-white outline-none resize-none h-10 focus:h-24 transition-all duration-300 text-sm py-2"
                        placeholder="Viết bình luận..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => !user && navigate('/login')}
                    ></textarea>
                </div>
                {content.trim() && (
                    <div className="flex justify-end mt-2 animate-fade-in gap-2">
                         <button type="button" onClick={() => setContent('')} className="text-xs font-bold text-white hover:bg-white/10 px-3 py-2 rounded-full transition">Hủy</button>
                         <button disabled={loading} className="bg-[#3ea6ff] text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-[#65b8ff] transition shadow-lg disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-400">Bình luận</button>
                    </div>
                )}
            </form>
        </div>

        <div className="space-y-2">
            {rootComments.length > 0 ? rootComments.map(cmt => (
                <CommentItem key={cmt.id} cmt={cmt} />
            )) : (
                // Căn giữa thông báo trống
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl bg-white/5">
                    <FaComments className="text-4xl mb-3 opacity-30" />
                    <p className="text-sm font-medium">Chưa có bình luận nào.</p>
                    <p className="text-xs opacity-60 mt-1">Hãy là người đầu tiên chia sẻ cảm nghĩ về phim này!</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default CommentSection;