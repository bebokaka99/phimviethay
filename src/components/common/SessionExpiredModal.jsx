import React from 'react';
import { FaSignOutAlt, FaExclamationTriangle } from 'react-icons/fa';

const SessionExpiredModal = ({ isOpen, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 flex flex-col items-center text-center transform transition-all scale-100 ring-1 ring-red-500/20">
                
                {/* Icon cảnh báo */}
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                    <FaExclamationTriangle size={30} />
                </div>

                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Phiên đăng nhập hết hạn</h3>
                
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ và bảo mật tài khoản của bạn.
                </p>

                <button 
                    onClick={onConfirm}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                    <FaSignOutAlt />
                    Đăng nhập lại ngay
                </button>
            </div>
        </div>
    );
};

export default SessionExpiredModal;