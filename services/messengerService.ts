
import { Message, User } from '../types';
import { BROADCAST_CHANNEL_NAME } from '../constants';

type MessengerCallback = (message: Message) => void;
type PresenceCallback = (user: User) => void;

class MessengerService {
  private channel: BroadcastChannel;
  private messageCallbacks: Set<MessengerCallback> = new Set();
  private presenceCallbacks: Set<PresenceCallback> = new Set();

  constructor() {
    this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    this.channel.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'message') {
        this.messageCallbacks.forEach(cb => cb(data));
      } else if (type === 'presence') {
        this.presenceCallbacks.forEach(cb => cb(data));
      }
    };
  }

  onMessage(callback: MessengerCallback) {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  onPresence(callback: PresenceCallback) {
    this.presenceCallbacks.add(callback);
    return () => this.presenceCallbacks.delete(callback);
  }

  sendMessage(message: Message) {
    this.channel.postMessage({ type: 'message', data: message });
  }

  broadcastPresence(user: User) {
    this.channel.postMessage({ type: 'presence', data: user });
  }

  saveMessage(message: Message) {
    const history = JSON.parse(localStorage.getItem(`history_${message.roomId}`) || '[]');
    history.push(message);
    // Keep only last 100 messages for local performance
    const prunedHistory = history.slice(-100);
    localStorage.setItem(`history_${message.roomId}`, JSON.stringify(prunedHistory));
  }

  getHistory(roomId: string): Message[] {
    return JSON.parse(localStorage.getItem(`history_${roomId}`) || '[]');
  }
}

export const messengerService = new MessengerService();
