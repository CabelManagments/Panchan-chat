
import React, { useState, useEffect, useCallback } from 'react';
import { User, Message, AppState } from './types';
import { AVATARS, COLORS } from './constants';
import { messengerService } from './services/messengerService';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState('general');
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  // Load user from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setAppState('chat');
    }
  }, []);

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 11),
      name: usernameInput,
      avatar: selectedAvatar,
      color: selectedColor,
      status: 'online',
    };

    setCurrentUser(newUser);
    localStorage.setItem('nexus_user', JSON.stringify(newUser));
    setAppState('chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_user');
    setCurrentUser(null);
    setAppState('setup');
  };

  if (appState === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-md bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
              <i className="fa-solid fa-comments text-3xl text-white"></i>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Nexus Messenger</h1>
            <p className="text-slate-400 text-center">Set up your local profile to start chatting across tabs and devices.</p>
          </div>

          <form onSubmit={handleSetup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Your Username</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Enter a cool name..."
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Choose Avatar</label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {AVATARS.map((avatar, idx) => (
                  <img
                    key={idx}
                    src={avatar}
                    className={`w-14 h-14 rounded-full cursor-pointer border-4 transition-all ${
                      selectedAvatar === avatar ? 'border-indigo-500 scale-110' : 'border-transparent hover:border-slate-600'
                    }`}
                    onClick={() => setSelectedAvatar(avatar)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Pick your Color</label>
              <div className="flex gap-4">
                {COLORS.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`w-8 h-8 rounded-full ${color} ${
                      selectedColor === color ? 'ring-4 ring-white ring-offset-4 ring-offset-slate-800' : ''
                    }`}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              Start Chatting
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {currentUser && (
        <>
          <Sidebar
            currentRoomId={currentRoomId}
            onRoomChange={setCurrentRoomId}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
          <ChatWindow
            roomId={currentRoomId}
            currentUser={currentUser}
          />
        </>
      )}
    </div>
  );
};

export default App;
