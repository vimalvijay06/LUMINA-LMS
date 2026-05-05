import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, X, Loader2, MessageSquare, Volume2 } from 'lucide-react';
import { secureFetch } from '../utils/auth';

const AIAssistant = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hello ${user.name}! I am the Lumina Library AI. I can recommend books, check our catalog, or answer questions. How can I help you today?`
        }
    ]);
    const [inputStr, setInputStr] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [playingMessageId, setPlayingMessageId] = useState(null);
    const messagesEndRef = useRef(null);
    const currentAudioRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL;

    // Stop audio if chat closes
    useEffect(() => {
        if (!isOpen && currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
            setPlayingMessageId(null);
        }
    }, [isOpen]);

    const playAudio = async (text, msgIdx) => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }

        if (playingMessageId === msgIdx) {
            setPlayingMessageId(null);
            return;
        }

        setPlayingMessageId(msgIdx);
        try {
            // PROXY CALL: Using backend TTS endpoint
            const response = await secureFetch(`${API_URL}/ai/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (!response.ok) throw new Error('Audio generation failed');

            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            currentAudioRef.current = audio;
            audio.onended = () => setPlayingMessageId(null);
            audio.play();
        } catch (error) {
            console.error('Audio playback error:', error);
            setPlayingMessageId(null);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const text = inputStr.trim();
        if (!text) return;

        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInputStr('');
        setIsLoading(true);

        try {
            // PROXY CALL: Using backend chat endpoint
            const res = await secureFetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages })
            });
            const result = await res.json();

            if (result.success) {
                setMessages([...newMessages, { role: 'assistant', content: result.content }]);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error("AI Proxy Error:", error);
            setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I am having trouble connecting to the library AI right now.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-50 group border-[3px] border-white"
            >
                <MessageSquare size={28} />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-indigo-600"></span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[380px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] z-50 overflow-hidden flex flex-col border border-gray-100 animate-in slide-in-from-bottom-10 fade-in duration-300 h-[500px]">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-4 flex justify-between items-center text-white shadow-md z-10 relative">
                <div className="flex items-center gap-3 relative z-10">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-inner">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-wide">Library AI <span className="opacity-70 text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1">Beta</span></h3>
                        <p className="text-[10px] text-indigo-100 font-medium">Securely Powered by Groq</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors relative z-10">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-auto mb-1 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md'}`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm relative group ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'}`}>
                            {msg.content}
                            {msg.role === 'assistant' && (
                                <button
                                    onClick={() => playAudio(msg.content, idx)}
                                    className="absolute -right-8 bottom-0 p-1.5 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-100 rounded-full shadow-sm"
                                    title="Read Aloud"
                                >
                                    {playingMessageId === idx ? <Loader2 size={12} className="text-indigo-600 animate-spin" /> : <Volume2 size={12} />}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3 max-w-[85%] self-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-auto mb-1 shadow-md">
                            <Bot size={14} />
                        </div>
                        <div className="p-3 bg-white rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm flex items-center gap-2">
                            <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex items-end gap-2 relative">
                    <input 
                        type="text"
                        value={inputStr}
                        onChange={(e) => setInputStr(e.target.value)}
                        placeholder="Ask about books, availability..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-700"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !inputStr.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-200"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIAssistant;
