
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message } from '../types';
import { DEFAULT_ROOMS } from '../constants';
import { messengerService } from '../services/messengerService';
import { askGemini } from '../services/geminiService';

interface ChatWindowProps {
  roomId: string;
  currentUser: User;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ roomId, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const room = DEFAULT_ROOMS.find(r => r.id === roomId) || DEFAULT_ROOMS[0];

  // Initialize messages from history
  useEffect(() => {
    const history = messengerService.getHistory(roomId);
    setMessages(history);
  }, [roomId]);

  // Handle incoming messages
  useEffect(() => {
    const unsubscribe = messengerService.onMessage((newMsg) => {
      if (newMsg.roomId === roomId) {
        setMessages(prev => [...prev, newMsg]);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, aiTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 11),
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: inputText,
      timestamp: Date.now(),
      roomId,
      type: 'text'
    };

    // Update local state and broadcast
    setMessages(prev => [...prev, userMessage]);
    messengerService.saveMessage(userMessage);
    messengerService.sendMessage(userMessage);
    
    const textToProcess = inputText;
    setInputText('');

    // Trigger AI if in Nexus AI Lab or if mentioned
    if (roomId === 'nexus-ai' || textToProcess.toLowerCase().includes('@gemini')) {
      handleAiResponse(textToProcess);
    }
  };

  const handleAiResponse = async (prompt: string) => {
    setAiTyping(true);
    
    // Create a context for Gemini from recent messages
    const aiResponseText = await askGemini(prompt);
    
    const aiMessage: Message = {
      id: Math.random().toString(36).substring(2, 11),
      senderId: 'gemini-ai',
      senderName: 'Gemini AI',
      content: aiResponseText,
      timestamp: Date.now(),
      roomId,
      type: 'ai'
    };

    setAiTyping(false);
    setMessages(prev => [...prev, aiMessage]);
    messengerService.saveMessage(aiMessage);
    messengerService.sendMessage(aiMessage);
  };

  return (
    <div className="flex-1 flex flex-col relative bg-slate-950">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-800 text-indigo-400">
            <i className={`fa-solid ${room.icon} text-xl`}></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{room.name}</h3>
            <p className="text-sm text-slate-500">{room.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:text-white transition-colors">
            <i className="fa-solid fa-phone"></i>
          </button>
          <button className="p-2 text-slate-500 hover:text-white transition-colors">
            <i className="fa-solid fa-video"></i>
          </button>
          <button className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && !aiTyping && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
            <i className="fa-solid fa-comments text-6xl opacity-20"></i>
            <p className="text-lg">Start a conversation. This is your local space.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isAi = msg.type === 'ai';

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
            >
              <div className={`flex items-end gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && (
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAi ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                    {isAi ? (
                      <i className="fa-solid fa-microchip text-white text-xs"></i>
                    ) : (
                      <span className="text-xs font-bold text-white uppercase">{msg.senderName.charAt(0)}</span>
                    )}
                  </div>
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className="text-xs font-medium text-slate-500 mb-1 ml-1">{msg.senderName}</span>}
                  <div 
                    className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-600/10' 
                        : isAi
                          ? 'bg-slate-800 border border-indigo-500/30 text-slate-200 rounded-bl-none shadow-xl'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none shadow-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {aiTyping && (
          <div className="flex items-start gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center animate-pulse">
                <i className="fa-solid fa-microchip text-white text-xs"></i>
             </div>
             <div className="flex flex-col items-start">
               <span className="text-xs font-medium text-slate-500 mb-1">Gemini AI</span>
               <div className="px-5 py-3 rounded-2xl bg-slate-800 border border-indigo-500/30 flex gap-1">
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <footer className="p-8 pt-4">
        <form 
          onSubmit={handleSendMessage}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all shadow-2xl"
        >
          <button type="button" className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
            <i className="fa-solid fa-plus text-lg"></i>
          </button>
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white px-2 py-3 placeholder:text-slate-600"
            placeholder={roomId === 'nexus-ai' ? "Ask Gemini anything..." : "Message " + room.name}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button type="button" className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
              <i className="fa-regular fa-face-smile text-xl"></i>
            </button>
            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="w-12 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl transition-all shadow-lg active:scale-90"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </form>
        <p className="text-center text-[10px] text-slate-600 mt-4 font-medium uppercase tracking-tighter">
          Encrypted local session • Messages remain in your browser
        </p>
      </footer>
    </div>
  );
};

export default ChatWindow;
