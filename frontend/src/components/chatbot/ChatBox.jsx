import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../axiosConfig/axiosConfig';
import { 
    Send, 
    User, 
    Bot, 
    MessageCircle, 
    X, 
    Minimize2, 
    MoreHorizontal,
    Sparkles,
    Trash2
} from 'lucide-react';

/**
 * ChatBox Component
 * A modern, responsive chat interface for interacting with the Badminton AI Assistant.
 * 
 * Features:
 * - Functional component with Hooks (useState, useEffect, useRef)
 * - Modern Tailwind CSS styling
 * - Auto-scroll to bottom
 * - Loading indicator during API calls
 * - API integration using existing axiosClient
 */
const ChatBox = () => {
    // State for message history
    const [messages, setMessages] = useState([
        { 
            sender: 'ai', 
            text: 'Xin chào! Tôi là trợ lý ảo hỗ trợ đặt sân cầu lông. Bạn cần giúp đỡ gì hôm nay?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    
    // State for user input
    const [inputValue, setInputValue] = useState('');
    
    // State for loading/typing status
    const [isLoading, setIsLoading] = useState(false);
    
    // State for visibility (floating widget style)
    const [isOpen, setIsOpen] = useState(false);
    
    // Ref for auto-scrolling to the latest message
    const messagesEndRef = useRef(null);

    // Auto-scroll function
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll whenever messages or loading state changes
    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isLoading, isOpen]);

    /**
     * Handles sending a message to the backend
     */
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        const trimmedMessage = inputValue.trim();
        if (!trimmedMessage || isLoading) return;

        // 1. Add user message to state
        const userMsg = { 
            sender: 'user', 
            text: trimmedMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            // 2. Call Backend API
            // Note: Using the base axiosClient which already has baseURL: http://localhost:8080/api
            const response = await axiosClient.post('/chatbot/message', { 
                message: trimmedMessage 
            });

            // 3. Extract text response
            // Backend might return plain string or object { message: "...", ... }
            let aiResponseText = '';
            if (typeof response.data === 'string') {
                aiResponseText = response.data;
            } else if (response.data && response.data.message) {
                aiResponseText = response.data.message;
            } else if (response.data && response.data.response) {
                aiResponseText = response.data.response;
            }
            else if (response.data && response.data.reply) {       // <--- THÊM DÒNG NÀY ĐỂ BẮT CHỮ 'reply'
                aiResponseText = response.data.reply;
            }else {
                aiResponseText = "Tôi không nhận được phản hồi hợp lệ từ máy chủ.";
            }

            // 4. Update chat history with AI response
            setMessages(prev => [...prev, { 
                sender: 'ai', 
                text: aiResponseText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

        } catch (error) {
            console.error("Chatbot API Error:", error);
            setMessages(prev => [...prev, { 
                sender: 'ai', 
                text: "Rất tiếc, đã có lỗi kết nối xảy ra. Vui lòng kiểm tra lại mạng hoặc thử lại sau.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        if (window.confirm("Bạn có muốn xóa toàn bộ lịch sử tin nhắn?")) {
            setMessages([{ 
                sender: 'ai', 
                text: 'Lịch sử đã được xóa. Tôi có thể giúp gì thêm cho bạn?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className={`w-96 max-w-[calc(100vw-3rem)] h-[550px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'}`}>
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                    <Bot size={22} className="text-white" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                                    AI Assist <Sparkles size={12} className="text-yellow-300" />
                                </h3>
                                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                                    Sẵn sàng hỗ trợ
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={clearChat}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-100"
                                title="Xóa lịch sử"
                            >
                                <Trash2 size={18} />
                            </button>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Minimize2 size={18} />
                            </button>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#f8fafc] custom-scrollbar">
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                            >
                                <div className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                                            msg.sender === 'user' 
                                            ? 'bg-blue-600 text-white shadow-blue-200' 
                                            : 'bg-white text-indigo-600 border border-indigo-50 shadow-indigo-100'
                                        }`}>
                                            {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        
                                        <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
                                            msg.sender === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
                                </div>
                            </div>
                        ))}
                        
                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex flex-col items-start max-w-[85%]">
                                    <div className="flex items-end gap-2">
                                        <div className="shrink-0 w-8 h-8 rounded-lg bg-white border border-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm animate-pulse">
                                            <Bot size={16} />
                                        </div>
                                        <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center shadow-sm">
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:800ms]"></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms] [animation-duration:800ms]"></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms] [animation-duration:800ms]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form 
                            onSubmit={handleSendMessage} 
                            className="bg-gray-50 flex items-center gap-1 p-1 pl-3 rounded-2xl border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-gray-400 text-gray-700"
                            />
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <MoreHorizontal size={18} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center ${
                                        !inputValue.trim() || isLoading
                                        ? 'bg-gray-200 text-gray-400'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200'
                                    }`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`mt-4 w-14 h-14 rounded-full shadow-2xl transition-all duration-500 transform active:scale-90 flex items-center justify-center group relative overflow-hidden ${
                    isOpen 
                    ? 'bg-white text-gray-600 rotate-90 scale-90 border border-gray-100' 
                    : 'bg-blue-600 text-white hover:bg-indigo-700 scale-110 hover:-translate-y-1'
                }`}
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse z-10"></div>
                        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform duration-300" />
                    </>
                )}
            </button>

            {/* Global Injected Style for scrollbar */}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
            `}} />
        </div>
    );
};

export default ChatBox;
