import { ChatMessage } from '../types';

class ChatService {
  private channel = new BroadcastChannel('nestin_chat');
  private messageCallbacks: ((msg: ChatMessage) => void)[] = [];
  private initialMessagesCallbacks: ((msgs: ChatMessage[]) => void)[] = [];

  constructor() {
    this.channel.onmessage = (event) => {
      if (event.data.type === 'new-message') {
        const msg = event.data.payload;
        this.saveMessageLocal(msg);
        this.messageCallbacks.forEach(cb => cb(msg));
      }
    };
  }

  private saveMessageLocal(msg: ChatMessage) {
    const msgs = this.getMessagesLocal();
    if (!msgs.find(m => m.id === msg.id)) {
      msgs.push(msg);
      localStorage.setItem('nestin_chat_messages', JSON.stringify(msgs));
    }
  }

  private getMessagesLocal(): ChatMessage[] {
    try {
      return JSON.parse(localStorage.getItem('nestin_chat_messages') || '[]');
    } catch {
      return [];
    }
  }

  connect() { return this; }

  joinRoom(roomId: string) {
    const msgs = this.getMessagesLocal().filter(m => m.roomId === roomId);
    this.initialMessagesCallbacks.forEach(cb => cb(msgs));
  }

  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const fullMsg: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString()
    };
    
    this.saveMessageLocal(fullMsg);
    this.messageCallbacks.forEach(cb => cb(fullMsg));
    this.channel.postMessage({ type: 'new-message', payload: fullMsg });
  }

  onNewMessage(callback: (msg: ChatMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  onInitialMessages(callback: (msgs: ChatMessage[]) => void) {
    this.initialMessagesCallbacks.push(callback);
  }

  disconnect() {}
}

export const chatService = new ChatService();
