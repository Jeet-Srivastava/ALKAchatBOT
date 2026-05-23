import { useState } from 'react';
import ChatRoom from './ChatRoom';

interface Tab {
  id: string;
  name: string;
}

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 'tab-1', name: 'Session 1' }]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  const createNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab = { id: newId, name: `Session ${tabs.length + 1}` };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, idToRemove: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    
    const newTabs = tabs.filter(tab => tab.id !== idToRemove);
    setTabs(newTabs);
    
    if (activeTabId === idToRemove) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-white overflow-hidden font-sans">
      <header className="bg-gray-900 border-b border-gray-800 p-3 flex items-center gap-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-t-lg cursor-pointer transition-colors ${
                activeTabId === tab.id 
                  ? 'bg-gray-800 text-blue-400 border-t-2 border-blue-500' 
                  : 'hover:bg-gray-800/50 text-gray-400'
              }`}
            >
              <span className="text-sm font-medium whitespace-nowrap">{tab.name}</span>
              {tabs.length > 1 && (
                <button 
                  onClick={(e) => closeTab(e, tab.id)}
                  className="text-gray-500 hover:text-red-400 rounded-full p-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={createNewTab}
          className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700"
        >
          + New Session
        </button>
      </header>

      <main className="flex-1 relative">
        {tabs.map((tab) => (
          <div 
            key={tab.id} 
            className={`absolute inset-0 ${activeTabId === tab.id ? 'block' : 'hidden'}`}
          >
            {/* REMOVED the {activeTabId === tab.id && ...} wrapper */}
            <ChatRoom tabId={tab.id} />
          </div>
        ))}
      </main>
    </div>
  );
}