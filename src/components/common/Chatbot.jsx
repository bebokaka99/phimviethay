import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaRobot, FaPaperPlane, FaMinus } from 'react-icons/fa';
import axios from '../../services/axiosConfig';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Chào bạn! Mình là trợ lý PhimVietHay 🤖. Bạn muốn tìm phim gì hôm nay?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống cuối khi mở chat hoặc có tin nhắn mới
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
                ? "AI đang quá tải do nhiều người dùng, bạn chờ 1 phút rồi thử lại nhé! ⏳"
                : "Lỗi kết nối, thử lại sau nhé! 🤖";
            
            setMessages(prev => [...prev, { text: errorMessage, sender: "bot" }]);
        } finally {
            setLoading(false);
        }
    };

    // Vị trí cố định của nút tròn (bottom-24 = 96px, right-8 = 32px)
    const buttonSize = '56px'; // w-14/h-14

    return createPortal(
        // [QUAN TRỌNG] Chỉ định kích thước nhỏ nhất cho container ngoài cùng khi đóng (Chỉ bằng nút bấm)
        // và dùng pointer-events-none để cho phép click xuyên qua toàn bộ container
        <div 
            className={`fixed bottom-24 right-8 z-[9999] font-sans transition-all duration-300 ${isOpen ? 'h-[500px] w-[350px]' : `h-[${buttonSize}] w-[${buttonSize}]`}`}
            style={{
                // Khi đóng, chỉ chặn click ở vùng của nút bấm
                pointerEvents: isOpen ? 'auto' : 'none', 
                height: isOpen ? '500px' : buttonSize,
                width: isOpen ? '350px' : buttonSize,
            }}
        >
            
            {/* Cửa sổ chat (Chỉ hiện khi mở) */}
            <div className={`
                w-[350px] h-[500px] bg-[#111] border border-white/10 rounded-2xl shadow-2xl 
                flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right
                ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'}
                ${isOpen ? 'absolute bottom-0 right-0' : 'hidden'} 
            `}>
                
                {/* Header Chatbot (Thu nhỏ) */}
                <div className="bg-gradient-to-r from-red-700 to-red-900 p-4 flex justify-between items-center cursor-pointer select-none" onClick={() => setIsOpen(false)} style={{ pointerEvents: 'auto' }}>
                    <div className="flex items-center gap-2">
                        <FaRobot className="text-white text-xl" />
                        <h3 className="font-bold text-white">Trợ Lý Phim AI</h3>
                    </div>
                    <FaMinus className="text-white/80 hover:text-white"/>
                </div>

                {/* Nội dung chat */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a] custom-scrollbar" style={{ pointerEvents: 'auto' }}>
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
                <form onSubmit={handleSend} className="p-3 bg-[#111] border-t border-white/10 flex gap-2" style={{ pointerEvents: 'auto' }}>
                    <input 
                        type="text" 
                        placeholder="Tìm phim gì..." 
                        className="flex-1 bg-gray-800 text-white text-sm rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-red-500 placeholder-gray-500 transition-all"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" disabled={loading} className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition disabled:opacity-50 shadow-lg shadow-red-900/20">
                        <FaPaperPlane className="text-sm ml-1" />
                    </button>
                </form>
            </div>

            {/* Nút tròn mở/đóng chat */}
            {/* Nút này luôn nằm ở góc phải dưới cùng của container */}
            <button 
                onClick={() => setIsOpen(true)}
                className={`w-14 h-14 bg-gradient-to-r from-red-600 to-orange-600 rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform animate-bounce-slow ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                style={{ position: 'absolute', bottom: 0, right: 0, pointerEvents: 'auto' }} 
            >
                <FaRobot />
            </button>

        </div>,
        document.body
    );
};

export default Chatbot;