import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaComments, FaThumbsUp, FaChevronDown, FaChevronUp, FaThumbtack, FaCrown, FaShieldAlt, FaTrash } from 'react-icons/fa';
import { getComments, addComment, deleteComment, toggleLikeComment, togglePinComment } from '../../services/commentService';
import { getCurrentUser } from '../../services/authService';
import UserAvatar from '../common/UserAvatar';

// Helper: Format thời gian
const timeAgo = (dateString) => {
    if (!dateString) return '';
    let dateStr = String(dateString); if (!dateStr.includes('Z')) dateStr += 'Z';
    const date = new Date(dateStr); const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Vừa xong';
    const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24); return `${days} ngày trước`;
};

// --- COMPONENT CON: ITEM BÌNH LUẬN (Đưa ra ngoài để tránh Re-render gây giật) ---
const CommentItem = ({ cmt, user, allComments, actions, openRepliesState, replyState }) => {
    const isReply = !!cmt.parent_id;
    // Lọc replies trực tiếp từ props để tránh tính toán lại
    const replies = !isReply ? allComments.filter(c => c.parent_id === cmt.id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) : [];
    
    const isAdminOrSuper = user?.role === 'admin' || user?.role === 'super_admin';
    const isPinned = Boolean(cmt.is_pinned);
    const isOwner = user?.id === cmt.user_id;
    const { openReplies, setOpenReplies } = openRepliesState;
    const { replyTo, setReplyTo, replyContent, setReplyContent, handleReplySubmit } = replyState;

    // Style cho Role
    const getNameStyle = (role) => {
        if (role === 'super_admin') return 'text-yellow-400 font-extrabold';
        if (role === 'admin') return 'text-red-500 font-bold';
        return 'text-white font-bold';
    };

    const renderBadge = (role) => {
        if (role === 'super_admin') return <span className="text-yellow-500 text-[10px] font-bold border border-yellow-500/50 px-1 rounded flex items-center gap-1"><FaCrown size={8}/> SUPER ADMIN</span>;
        if (role === 'admin') return <span className="text-red-500 text-[10px] font-bold border border-red-500/50 px-1 rounded flex items-center gap-1"><FaShieldAlt size={8}/> ADMIN</span>;
        return null;
    };

    return (
        <div className={`flex gap-3 ${isReply ? 'mt-3' : 'mt-6'} p-3 rounded-lg transition-all duration-300 ${isPinned ? 'bg-green-900/10 border border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border border-transparent hover:bg-white/5'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
                <UserAvatar user={cmt} className="w-full h-full" />
            </div>

            <div className="flex-1 min-w-0">
                {/* Header: Tên, Badge, Time */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    {isPinned && <FaThumbtack className="text-green-500 text-xs rotate-45 animate-pulse" title="Được ghim" />}
                    <span className={`text-sm ${getNameStyle(cmt.role)} cursor-pointer hover:underline`}>
                        {cmt.fullname || cmt.username}
                    </span>
                    {renderBadge(cmt.role)}
                    <span className="text-xs text-gray-500 ml-auto">{timeAgo(cmt.created_at)}</span>
                </div>

                {/* Content */}
                <div className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${isPinned ? 'text-white font-medium' : 'text-gray-300'}`}>
                    {cmt.content}
                </div>

                {/* Actions Bar */}
                <div className="flex items-center gap-4 mt-2 select-none">
                    {/* Like */}
                    <button onClick={() => actions.handleLike(cmt.id)} className={`text-xs font-bold flex gap-1 items-center transition ${cmt.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
                        <FaThumbsUp/> {cmt.like_count > 0 && cmt.like_count}
                    </button>

                    {/* Reply Button */}
                    {!isReply && (
                        <button onClick={() => setReplyTo(replyTo === cmt.id ? null : cmt.id)} className="text-xs font-bold text-gray-400 hover:text-white transition">
                            Phản hồi
                        </button>
                    )}

                    {/* Delete Button (Luôn hiện với Admin/Owner) */}
                    {(isOwner || isAdminOrSuper) && (
                        <button onClick={() => actions.handleDelete(cmt.id)} className="text-xs font-bold text-gray-500 hover:text-red-500 flex items-center gap-1 transition">
                            <FaTrash size={10}/> Xóa
                        </button>
                    )}

                    {/* Pin Button (Chỉ Admin & Comment gốc) */}
                    {isAdminOrSuper && !isReply && (
                        <button onClick={() => actions.handlePin(cmt.id)} className={`text-xs font-bold ml-auto flex items-center gap-1 transition ${isPinned ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}>
                            <FaThumbtack size={10} className={isPinned ? '' : 'rotate-45'} />
                            {isPinned ? 'Bỏ ghim' : 'Ghim'}
                        </button>
                    )}
                </div>

                {/* Form Reply */}
                {replyTo === cmt.id && (
                    <form onSubmit={(e) => handleReplySubmit(e, cmt.id)} className="mt-3 flex gap-2 animate-fade-in">
                        <input 
                            autoFocus 
                            className="flex-1 bg-transparent border-b border-gray-600 text-white text-sm py-1 outline-none focus:border-blue-500 transition" 
                            value={replyContent} 
                            onChange={e => setReplyContent(e.target.value)} 
                            placeholder={`Phản hồi ${cmt.fullname || cmt.username}...`} 
                        />
                        <button disabled={!replyContent.trim()} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full font-bold transition disabled:opacity-50">Gửi</button>
                    </form>
                )}

                {/* Danh sách Reply con */}
                {!isReply && replies.length > 0 && (
                    <div className="mt-2">
                        <button onClick={() => setOpenReplies(p => ({...p, [cmt.id]: !p[cmt.id]}))} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold transition">
                            {openReplies[cmt.id] ? <FaChevronUp/> : <FaChevronDown/>} {replies.length} phản hồi
                        </button>
                        {openReplies[cmt.id] && (
                            <div className="pl-4 border-l-2 border-white/10 mt-2">
                                {replies.map(r => (
                                    <CommentItem 
                                        key={r.id} 
                                        cmt={r} 
                                        user={user} 
                                        allComments={allComments} 
                                        actions={actions}
                                        openRepliesState={{openReplies, setOpenReplies}}
                                        replyState={{replyTo, setReplyTo, replyContent, setReplyContent, handleReplySubmit}}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const CommentSection = ({ movieSlug, episodeSlug }) => {
    const [comments, setComments] = useState([]);
    const [user, setUser] = useState(getCurrentUser());
    const [content, setContent] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [openReplies, setOpenReplies] = useState({});
    const navigate = useNavigate();

    useEffect(() => { if (movieSlug) loadComments(); }, [movieSlug, episodeSlug]);
    const loadComments = async () => { setComments(await getComments(movieSlug, episodeSlug)); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        if (!content.trim()) return;

        await addComment({ movieSlug, episodeSlug: episodeSlug || null, content });
        loadComments();
        setContent('');
    };

    const handleReplySubmit = async (e, parentId) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        if (!replyContent.trim()) return;

        await addComment({ movieSlug, episodeSlug: episodeSlug || null, content: replyContent, parentId });
        loadComments();
        setReplyTo(null);
        setReplyContent('');
        setOpenReplies(p => ({...p, [parentId]: true}));
    };

    const handleLike = async (id) => {
        if (!user) { navigate('/login'); return; }
        setComments(p => p.map(c => c.id === id ? { ...c, is_liked: !c.is_liked, like_count: c.is_liked ? c.like_count - 1 : c.like_count + 1 } : c));
        await toggleLikeComment(id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa bình luận này?')) { await deleteComment(id); loadComments(); }
    };

    const handlePin = async (id) => {
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return;
        await togglePinComment(id);
        loadComments();
    };

    // Gom nhóm actions để truyền xuống
    const actions = { handleLike, handleDelete, handlePin };

    return (
        <div className="mt-8 max-w-5xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaComments className="text-red-500"/> Bình luận <span className="text-gray-500 text-lg font-normal">({comments.length})</span>
            </h3>
            
            <div className="flex gap-4 mb-8">
                <div className="w-10 h-10 flex-shrink-0">
                    <UserAvatar user={user} className="w-full h-full" />
                </div>
                <form onSubmit={handleSubmit} className="flex-1">
                    <textarea 
                        className="w-full bg-transparent border-b border-gray-700 text-white p-2 outline-none focus:border-red-500 transition resize-none h-10 focus:h-24 text-sm" 
                        placeholder="Chia sẻ cảm nghĩ của bạn về phim..." 
                        value={content} 
                        onChange={e => setContent(e.target.value)} 
                        onFocus={() => !user && navigate('/login')} 
                    />
                    {content && (
                        <div className="flex justify-end mt-2 animate-fade-in">
                            <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg transition transform hover:scale-105">Gửi</button>
                        </div>
                    )}
                </form>
            </div>

            <div className="space-y-2">
                {comments.filter(c => !c.parent_id).map(c => (
                    <CommentItem 
                        key={c.id} 
                        cmt={c} 
                        user={user} 
                        allComments={comments} 
                        actions={actions}
                        openRepliesState={{openReplies, setOpenReplies}}
                        replyState={{replyTo, setReplyTo, replyContent, setReplyContent, handleReplySubmit}}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentSection;