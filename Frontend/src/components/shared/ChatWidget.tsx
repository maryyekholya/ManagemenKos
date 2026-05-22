import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, User, ShieldCheck, Plus } from 'lucide-react';
import { useApp } from '../../App';
import { chatService } from '../../services/chatService';
import { ChatMessage } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './UI';

interface ChatWidgetProps {
  roomId?: string; 
  targetName?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'tenant' | 'internal';
  lastMessage?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ roomId: initialRoomId, targetName: initialTargetName }) => {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(initialRoomId || '');
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize rooms based on role
  useEffect(() => {
    if (!state.currentUser) return;

    const availableRooms: ChatRoom[] = [];

    if (state.currentUser.role === 'user') {
      availableRooms.push({ id: state.currentUser.id, name: 'Admin NestIn', type: 'tenant' });
    } else if (state.currentUser.role === 'manager') {
      if (initialRoomId && initialTargetName) {
        availableRooms.push({ id: initialRoomId, name: `Tenant: ${initialTargetName}`, type: 'tenant' });
      }
      availableRooms.push({ id: 'admin-manager', name: 'Admin Koordinasi', type: 'internal' });
    } else if (state.currentUser.role === 'admin') {
      if (initialRoomId && initialTargetName) {
        availableRooms.push({ id: initialRoomId, name: `Tenant: ${initialTargetName}`, type: 'tenant' });
      }
      availableRooms.push({ id: 'admin-manager', name: 'Manager Coordination', type: 'internal' });
      availableRooms.push({ id: 'admin-organizer', name: 'Organizer System', type: 'internal' });
    } else if (state.currentUser.role === 'organizer') {
      availableRooms.push({ id: 'admin-organizer', name: 'Admin Control', type: 'internal' });
    }

    setRooms(availableRooms);
    
    // Auto-select first room if none or invalid
    if (!currentRoomId || !availableRooms.find(r => r.id === currentRoomId)) {
      if (availableRooms.length > 0) {
        // If it's a manager/admin, prefer the tenant room if it was just passed in
        if (initialRoomId && availableRooms.find(r => r.id === initialRoomId)) {
            setCurrentRoomId(initialRoomId);
        } else {
            setCurrentRoomId(availableRooms[0].id);
        }
      }
    }
  }, [state.currentUser, initialRoomId, initialTargetName]);

  useEffect(() => {
    if (isOpen) {
      const socket = chatService.connect();
      
      // Join all eligible rooms to receive notifications
      rooms.forEach(r => chatService.joinRoom(r.id));
      
      if (state.currentUser?.role === 'admin') {
        chatService.joinRoom('admins');
      }

      chatService.onInitialMessages((msgs) => {
        // Only set messages if they belong to current room
        // Actually the server sends initial messages for the room we JUST joined
        // but since we joined many, we need to be careful.
        // The server emits initial-messages based on the join-room event.
        // If we join many at once, we might get multiple initial-messages events.
        // Let's assume the last joined (current) is the one we want to display for now
        // or refine the service. For now, let's filter:
        setMessages(msgs.filter(m => m.roomId === currentRoomId));
      });

      chatService.onNewMessage((msg) => {
        if (msg.roomId === currentRoomId) {
          setMessages(prev => [...prev, msg]);
        }
      });
    }
  }, [isOpen, currentRoomId, rooms]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!state.currentUser) return;

    chatService.sendMessage({
      senderId: state.currentUser.id,
      senderName: state.currentUser.name,
      senderRole: state.currentUser.role,
      text: inputText,
      roomId: currentRoomId
    });

    setInputText('');
  };

  const activeRoom = rooms.find(r => r.id === currentRoomId);

  return (
    <div className="fixed bottom-8 right-8 z-[100] print:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-96 h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col border border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-emerald-600 text-white flex justify-between items-center relative z-20">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => rooms.length > 1 && setShowRoomSelector(!showRoomSelector)}
                  className={cn(
                    "w-10 h-10 bg-white/20 rounded-full flex items-center justify-center transition-all",
                    rooms.length > 1 && "hover:bg-white/30 cursor-pointer"
                  )}
                >
                  <User className="w-5 h-5 text-white" />
                </button>
                <div 
                  className={cn("cursor-default", rooms.length > 1 && "cursor-pointer")}
                  onClick={() => rooms.length > 1 && setShowRoomSelector(!showRoomSelector)}
                >
                   <h4 className="font-bold text-sm flex items-center gap-2">
                     {activeRoom?.name || 'Loading...'}
                     {rooms.length > 1 && (
                       <Plus className={cn("w-3 h-3 transition-transform", showRoomSelector ? "rotate-45" : "")} />
                     )}
                   </h4>
                   <p className="text-[10px] opacity-70">Obrolan Aktif</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                id="close-chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room Selector Overlay */}
            <AnimatePresence>
              {showRoomSelector && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-20 left-6 right-6 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 p-4 space-y-2"
                >
                  {rooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => {
                        setCurrentRoomId(room.id);
                        setShowRoomSelector(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                        currentRoomId === room.id ? "bg-emerald-50 text-emerald-600 font-bold" : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">{room.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 scroll-smooth relative z-10"
            >
              {messages.length === 0 && (
                <div className="text-center py-10 space-y-2 opacity-30">
                   <MessageSquare className="w-10 h-10 mx-auto" />
                   <p className="text-xs font-bold uppercase tracking-widest">Belum ada pesan di ruang ini</p>
                </div>
              )}
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%] rounded-2xl p-4 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300",
                    msg.senderId === state.currentUser?.id 
                      ? "ml-auto bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-100" 
                      : "mr-auto bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm"
                  )}
                >
                   {msg.senderRole !== 'user' && msg.senderId !== state.currentUser?.id && (
                     <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1 flex items-center gap-1">
                       <ShieldCheck className="w-3 h-3" /> {msg.senderName} ({msg.senderRole})
                     </p>
                   )}
                   <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                   <p className={cn(
                     "text-[9px] mt-1 opacity-60",
                     msg.senderId === state.currentUser?.id ? "text-right" : ""
                   )}>
                     {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 relative z-20">
               <div className="relative">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Tulis pesan..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    id="chat-input"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
                    id="send-chat"
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all animate-in zoom-in duration-500 group",
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700"
        )}
        id="toggle-chat"
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7 group-hover:scale-110 transition-transform" />}
      </Button>
    </div>
  );
};
