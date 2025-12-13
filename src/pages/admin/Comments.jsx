import React, { useEffect, useState } from 'react';
import { FaTrashAlt, FaExternalLinkAlt, FaUserCircle } from 'react-icons/fa';
import { getAllComments, deleteAdminComment } from '../../services/adminService';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchComments(); }, []);

  const fetchComments = async () => {
      const data = await getAllComments();
      setComments(data || []);
      setLoading(false);
  };

  const handleDelete = async (id) => {
      if(window.confirm('Xóa bình luận này?')) {
          await deleteAdminComment(id);
          fetchComments();
      }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');

  if(loading) return <div className="text-white p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div></div>;

  return (
    <div>
        <h1 className="text-2xl font-black text-white mb-6 border-l-4 border-red-600 pl-3">Quản Lý Bình Luận <span className="text-gray-500 text-lg font-normal">({comments.length})</span></h1>
        <div className="space-y-4">
            {comments.length > 0 ? comments.map(cmt => (
                <div key={cmt.id} className="bg-[#161616] p-4 rounded-xl border border-white/5 flex gap-4 hover:border-white/20 transition shadow-lg">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-gray-800">
                        {cmt.avatar ? <img src={cmt.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-500"><FaUserCircle/></div>}
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-bold text-white text-sm">{cmt.username}</span>
                            {cmt.role === 'admin' && <span className="text-[9px] bg-red-600 px-1.5 rounded text-white font-bold">ADMIN</span>}
                            <span className="text-xs text-gray-500">tại phim</span>
                            <a href={`/phim/${cmt.movie_slug}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1 border border-blue-500/30 px-1.5 py-0.5 rounded bg-blue-500/10">
                                {cmt.movie_slug} <FaExternalLinkAlt size={8} />
                            </a>
                            <span className="text-[10px] text-gray-600 ml-auto">{formatDate(cmt.created_at)}</span>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-sm text-gray-300">{cmt.content}</div>
                        {cmt.episode_slug && <div className="mt-1 flex justify-end"><span className="text-[10px] text-gray-500 bg-white/5 px-2 rounded">Tập: {cmt.episode_slug}</span></div>}
                    </div>
                    <button onClick={() => handleDelete(cmt.id)} className="self-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-3 rounded-full transition" title="Xóa bình luận này"><FaTrashAlt /></button>
                </div>
            )) : <p className="text-center text-gray-500 italic">Chưa có bình luận nào trong hệ thống.</p>}
        </div>
    </div>
  );
};

export default Comments;