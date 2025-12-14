import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaRobot, FaPaperPlane, FaTimes, FaMinus } from 'react-icons/fa';
import axios from '../../services/axiosConfig';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Chào bạn! Mình là trợ lý PhimVietHay 🤖. Bạn muốn tìm phim gì hôm nay?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống cuối
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { text: userMsg, sender: "user" }]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post('/ai/chat', { message: userMsg });
            setMessages(prev => [...prev, { text: res.reply, sender: "bot" }]);
        } catch (error) {
            const errorMessage = error.response && error.response.status === 429 
                ? "AI đang quá tải, chờ 1 phút nhé! ⏳"
                : "Lỗi kết nối, thử lại sau nhé! 🤖";
            
            setMessages(prev => [...prev, { text: errorMessage, sender: "bot" }]);
        } finally {
            setLoading(false);
        }
    };

    // Kích thước nút tròn
    const buttonSize = '56px'; 

    return createPortal(
        // [CONTAINER CHÍNH]
        // Mobile: Khi mở -> Full màn hình (fixed inset-0). Khi đóng -> Chỉ chiếm chỗ nút bấm.
        // Desktop (md): Giữ nguyên logic cũ (bottom-24 right-8).
        <div 
            className={`
                z-[9999] font-sans transition-all duration-300
                ${isOpen 
                    ? 'fixed inset-0 md:inset-auto md:bottom-24 md:right-8 w-full h-full md:w-[350px] md:h-[500px]' 
                    : `fixed bottom-20 right-4 md:bottom-24 md:right-8 w-[${buttonSize}] h-[${buttonSize}]`
                }
            `}
            style={{
                pointerEvents: isOpen ? 'auto' : 'none',
                // Cập nhật lại kích thước động cho style inline để đảm bảo animation mượt
                width: isOpen ? (window.innerWidth >= 768 ? '350px' : '100%') : buttonSize,
                height: isOpen ? (window.innerWidth >= 768 ? '500px' : '100%') : buttonSize,
            }}
        >
            
            {/* [CỬA SỔ CHAT] */}
            <div className={`
                bg-[#111] border-white/10 shadow-2xl flex flex-col overflow-hidden transition-all duration-300
                ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 translate-y-10 pointer-events-none'}
                
                /* Mobile: Full màn hình, không bo góc */
                w-full h-full rounded-none border-0
                
                /* Desktop: Popup nhỏ, bo góc, có viền */
                md:w-[350px] md:h-[500px] md:rounded-2xl md:border
                
                absolute bottom-0 right-0
            `}>
                
                {/* Header Chatbot */}
                <div className="bg-gradient-to-r from-red-700 to-red-900 p-4 flex justify-between items-center shrink-0 cursor-pointer md:cursor-default">
                    <div className="flex items-center gap-2" onClick={() => setIsOpen(false)}> {/* Cho phép click header để đóng trên mobile */}
                        <FaRobot className="text-white text-xl" />
                        <h3 className="font-bold text-white">Trợ Lý AI</h3>
                    </div>
                    {/* Nút đóng: Dùng icon Times (X) trên mobile cho dễ hiểu, Minus (-) trên PC */}
                    <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-2">
                        <span className="md:hidden"><FaTimes size={20}/></span>
                        <span className="hidden md:block"><FaMinus/></span>
                    </button>
                </div>

                {/* Nội dung chat */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a] custom-scrollbar pb-20 md:pb-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                                msg.sender === 'user' 
                                ? 'bg-red-600 text-white rounded-tr-none' 
                                : 'bg-gray-800 text-gray-200 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center h-10">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Ô nhập liệu */}
                <form onSubmit={handleSend} className="p-3 bg-[#111] border-t border-white/10 flex gap-2 shrink-0 safe-area-bottom">
                    <input 
                        type="text" 
                        placeholder="Hỏi về phim..." 
                        // Mobile dùng text-base (16px) để tránh iOS zoom, Desktop dùng text-sm
                        className="flex-1 bg-gray-800 text-white text-base md:text-sm rounded-full px-4 py-3 md:py-2 outline-none focus:ring-1 focus:ring-red-500 placeholder-gray-500 transition-all"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" disabled={loading} className="w-12 h-12 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition disabled:opacity-50 shadow-lg">
                        <FaPaperPlane className="text-base md:text-sm ml-1" />
                    </button>
                </form>
            </div>

            {/* Nút tròn mở/đóng chat */}
            <button 
                onClick={() => setIsOpen(true)}
                className={`
                    bg-gradient-to-r from-red-600 to-orange-600 rounded-full shadow-lg shadow-red-500/30 
                    flex items-center justify-center text-white hover:scale-110 transition-transform animate-bounce-slow
                    absolute bottom-0 right-0 z-50
                    ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}
                    w-14 h-14 text-2xl
                `}
            >
                <FaRobot />
            </button>

        </div>,
        document.body
    );
};

export default Chatbot;