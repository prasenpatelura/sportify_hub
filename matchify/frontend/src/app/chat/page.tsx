'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import api from '@/services/api';

export default function ChatPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeGameId, setActiveGameId] = useState('matchify-global-hub'); // Global chat room by default
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Connect to Socket.io
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
       console.log('Connected to chat server');
       newSocket.emit('joinRoom', activeGameId);
    });

    newSocket.on('receiveMessage', (message) => {
       setMessages((prev) => [...prev, message]);
    });

    return () => {
       newSocket.disconnect();
    };
  }, [user, router, activeGameId]);

  useEffect(() => {
    // Fetch historical messages when room changes
    const fetchMessages = async () => {
       try {
         const res = await api.get(`/messages/${activeGameId}`);
         if (res.data) {
             setMessages(Array.isArray(res.data) ? res.data : (res.data as any));
         }
       } catch (e) {
         console.warn('Could not fetch historical messages:', e);
         // Mock data if backend fails
         setMessages([
           { _id: '1', senderId: { _id: 'admin', name: 'Matchify Bot' }, content: 'Welcome to the global players hub!', createdAt: new Date().toISOString() }
         ]);
       }
    };
    if (user) fetchMessages();
  }, [activeGameId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;
    
    const msgData = {
       gameId: activeGameId,
       senderId: user._id,
       content: inputMessage,
       createdAt: new Date().toISOString(),
       _isPending: true // Optimistic UI
    };
    
    // Add optimistic message
    setMessages(prev => [...prev, { ...msgData, senderId: { _id: user._id, name: user.name } }]);
    
    // Send to server
    socket.emit('sendMessage', msgData);
    setInputMessage('');
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in h-[calc(100vh-100px)]">
       <div className="glass-panel h-full flex flex-col md:flex-row overflow-hidden rounded-3xl border border-slate-800">
          
          {/* Chat Sidebar */}
          <div className="w-full md:w-80 border-r border-slate-800 bg-black/40 flex flex-col">
             <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-extrabold text-white">Your Chats</h2>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div 
                   onClick={() => setActiveGameId('matchify-global-hub')}
                   className={`p-4 rounded-xl cursor-pointer transition-all ${activeGameId === 'matchify-global-hub' ? 'bg-[--color-primary]/20 border border-[--color-primary]/50' : 'bg-slate-800/50 hover:bg-slate-800'}`}
                >
                   <h3 className="text-white font-bold flex items-center gap-2">🌍 Global Hub</h3>
                   <p className="text-xs text-slate-400 mt-1">Talk with all active players.</p>
                </div>
                <div 
                   onClick={() => setActiveGameId('game-123')}
                   className={`p-4 rounded-xl cursor-pointer transition-all ${activeGameId === 'game-123' ? 'bg-[--color-secondary]/20 border border-[--color-secondary]/50' : 'bg-slate-800/50 hover:bg-slate-800'}`}
                >
                   <h3 className="text-white font-bold flex items-center gap-2">⚽ Friday Night Football</h3>
                   <p className="text-xs text-slate-400 mt-1">3 Players Online</p>
                </div>
             </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-slate-900/40">
             
             {/* Header */}
             <div className="p-6 border-b border-slate-800 bg-black/20 flex justify-between items-center backdrop-blur-md">
                <div>
                   <h3 className="text-lg font-bold text-white">
                     {activeGameId === 'matchify-global-hub' ? '🌍 Global Hub' : '⚽ Friday Night Football'}
                   </h3>
                   <p className="text-xs font-semibold text-green-400 animate-pulse flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Live Connecting
                   </p>
                </div>
             </div>

             {/* Message Feed */}
             <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {messages.map((msg, idx) => {
                   const isMe = msg.senderId?._id === user._id || msg.senderId === user._id;
                   return (
                      <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                         <span className="text-[10px] text-slate-500 font-bold uppercase mb-1 ml-1">{isMe ? 'You' : msg.senderId?.name}</span>
                         <div className={`px-5 py-3 rounded-2xl max-w-[80%] md:max-w-[60%] ${isMe ? 'bg-[--color-primary] text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm'}`}>
                            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                         </div>
                         <span className="text-[10px] text-slate-600 mt-1 font-medium">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                   )
                })}
                <div ref={messagesEndRef} />
             </div>

             {/* Input Area */}
             <div className="p-4 bg-black/40 border-t border-slate-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                   <input 
                      type="text" 
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..." 
                      className="flex-1 bg-slate-800/80 border border-slate-700 text-white px-5 py-4 rounded-full text-sm font-medium focus:outline-none focus:border-[--color-primary] transition-all"
                   />
                   <button 
                      type="submit" 
                      disabled={!inputMessage.trim()}
                      className="bg-gradient-to-r from-[--color-primary] to-[--color-secondary] p-4 rounded-full shadow-lg shadow-[--color-primary]/20 transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                         <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                      </svg>
                   </button>
                </form>
             </div>
          </div>

       </div>
    </div>
  );
}
