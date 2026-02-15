
import React from 'react';
import { User, Room } from '../types';
import { DEFAULT_ROOMS } from '../constants';

interface SidebarProps {
  currentRoomId: string;
  onRoomChange: (id: string) => void;
  currentUser: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRoomId, onRoomChange, currentUser, onLogout }) => {
  return (
    <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50 backdrop-blur-xl">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <i className="fa-solid fa-comments text-white text-xl"></i>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Nexus</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        <div className="px-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 px-2">Rooms</p>
          <div className="space-y-1">
            {DEFAULT_ROOMS.map((room) => (
              <button
                key={room.id}
                onClick={() => onRoomChange(room.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  currentRoomId === room.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${
                   currentRoomId === room.id ? 'bg-indigo-500/50' : 'bg-slate-800'
                }`}>
                  <i className={`fa-solid ${room.icon}`}></i>
                </div>
                <div className="text-left flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{room.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-900">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full border-2 border-slate-700" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-bold truncate text-white">{currentUser.name}</p>
            <p className="text-xs text-slate-500 truncate">Status: Online</p>
          </div>
          <button 
            onClick={onLogout}
            title="Log out"
            className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
        <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl">
          <i className="fa-solid fa-share-nodes text-indigo-400 text-sm"></i>
          <span className="text-xs text-slate-400 font-medium">Invite Link: </span>
          <span className="text-xs text-indigo-300 font-bold truncate">#nexus-{Math.random().toString(36).substr(2, 5)}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
