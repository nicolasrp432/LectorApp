import React, { useState, useRef, useEffect } from 'react';
import { startCoachChat } from '../services/ai.ts';
import { ChatMessage } from '../types.ts';

interface AICoachChatProps {
    isOpen?: boolean;
    onToggle?: () => void;
}

export const AICoachChat: React.FC<AICoachChatProps> = ({ isOpen, onToggle }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: '¡Hola! Soy tu Lector Coach. ¿En qué técnica de lectura o memoria te gustaría enfocarte hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        
        const userMsg = input;
        setInput('');
        
        const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
        setMessages(newMessages);
        setIsTyping(true);

        try {
            // Convert to Gemini history format
            const history = newMessages.slice(0, -1).map(m => ({
                role: m.role as 'user' | 'model',
                parts: [{ text: m.text }]
            }));
            
            const chat = startCoachChat(history);
            const result = await chat.sendMessage({ message: userMsg });
            setMessages(prev => [...prev, { role: 'model', text: result.text || 'No pude procesar eso, intenta de nuevo.' }]);
        } catch (error) {
            console.error("Coach Chat Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'Error de conexión con el Coach.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#1A2C20] to-[#112116] flex flex-col h-[420px] transition-all duration-500">
            {/* Header / Trigger */}
            <header 
                onClick={onToggle}
                className="p-4 bg-primary/10 flex items-center justify-between cursor-pointer hover:bg-primary/20 transition-colors shrink-0"
            >
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center text-primary shadow-sm">
                        <span className="material-symbols-outlined text-2xl">smart_toy</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider leading-none">Lector Coach IA</h3>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">{isTyping ? 'Escribiendo...' : 'En línea'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`size-1.5 rounded-full ${isTyping ? 'bg-primary animate-pulse' : 'bg-green-500'}`}></div>
                    <span className={`material-symbols-outlined text-gray-400 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
            </header>

            {/* Chat Body - Visible only when expanded */}
            <div className={`flex-1 flex flex-col min-h-0 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                                m.role === 'user' 
                                ? 'bg-primary text-black font-medium rounded-tr-none' 
                                : 'bg-white/10 text-gray-200 rounded-tl-none'
                            }`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                <div className="size-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                                <div className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="p-3 bg-black/40 flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Pregunta sobre técnicas de estudio..."
                        className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isTyping}
                        className="size-10 bg-primary rounded-xl flex items-center justify-center text-black active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-lg font-bold">send</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};