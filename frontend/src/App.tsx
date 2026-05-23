import { useState } from 'react';
import ChatRoom from './ChatRoom';

interface Session {
  id: string;
  name: string;
}

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([{ id: 'session-1', name: 'Session 1' }]);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');

  const createNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession = { id: newId, name: `Session ${sessions.length + 1}` };
    setSessions([...sessions, newSession]);
    setActiveSessionId(newId);
  };

  const closeSession = (e: React.MouseEvent, idToRemove: string) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    
    const newSessions = sessions.filter(session => session.id !== idToRemove);
    setSessions(newSessions);
    
    if (activeSessionId === idToRemove) {
      setActiveSessionId(newSessions[newSessions.length - 1].id);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-row bg-black text-white overflow-hidden font-sans">
      
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-900">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black px-4 py-3 rounded-lg font-medium transition-colors"
          >
            <span className="text-xl leading-none mb-0.5">+</span> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 no-scrollbar">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`group flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                activeSessionId === session.id 
                  ? 'bg-gray-800 text-white' 
                  : 'hover:bg-gray-900 text-gray-400'
              }`}
            >
              <span className="text-sm font-medium truncate pr-2">{session.name}</span>
              {sessions.length > 1 && (
                <button 
                  onClick={(e) => closeSession(e, session.id)}
                  className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                  title="Close Session"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 relative bg-black">
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className={`absolute inset-0 ${activeSessionId === session.id ? 'block' : 'hidden'}`}
          >
            <ChatRoom tabId={session.id} />
          </div>
        ))}
      </main>
      
    </div>
  );
}