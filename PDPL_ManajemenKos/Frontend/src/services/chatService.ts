import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '../types';

class ChatService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(window.location.origin);
    }
    return this.socket;
  }

  joinRoom(roomId: string) {
    this.socket?.emit('join-room', roomId);
  }

  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    this.socket?.emit('send-message', message);
  }

  onNewMessage(callback: (msg: ChatMessage) => void) {
    this.socket?.on('new-message', callback);
  }

  onInitialMessages(callback: (msgs: ChatMessage[]) => void) {
    this.socket?.on('initial-messages', callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const chatService = new ChatService();
