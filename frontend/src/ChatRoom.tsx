import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface ChatRoomProps {
  tabId: string;
}

export default function ChatRoom({ tabId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8000/ws');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chunk') {
        setIsTyping(true);
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          const lastMsg = newMessages[lastIndex];
          
          if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
            newMessages[lastIndex] = {
              ...lastMsg,
              content: lastMsg.content + data.content
            };
          } else {
            newMessages.push({
              id: Date.now().toString(),
              role: 'assistant',
              content: data.content,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isStreaming: true
            });
          }
          return newMessages;
        });
      } else if (data.type === 'done') {
        setIsTyping(false);
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          const lastMsg = newMessages[lastIndex];
          
          if (lastMsg && lastMsg.role === 'assistant') {
            newMessages[lastIndex] = {
              ...lastMsg,
              isStreaming: false
            };
          }
          return newMessages;
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [tabId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !wsRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    wsRef.current.send(JSON.stringify({ content: input.trim() }));
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-500 mb-1 px-1">{msg.timestamp}</span>
              <div 
                className={`max-w-[85%] px-5 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-gray-800 text-white rounded-2xl rounded-br-none' 
                    : 'bg-transparent text-gray-200 border border-gray-800 rounded-2xl rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start">
              <div className="bg-transparent border border-gray-800 text-gray-500 rounded-2xl rounded-bl-none px-5 py-3 text-sm flex items-center gap-2">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-150">●</span>
                <span className="animate-pulse delay-300">●</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 md:p-6 bg-black border-t border-gray-900">
        <form onSubmit={handleSend} className="flex gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Alchemyst..."
            className="flex-1 bg-gray-900 text-white placeholder-gray-500 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-600 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}