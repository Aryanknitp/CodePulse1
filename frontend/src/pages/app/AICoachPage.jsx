import { useState, useEffect, useRef } from 'react';
import { aiApi } from '../../services/aiApi.js';
import { useApp } from '../../context/AppContext.jsx';
import Button from '../../components/common/Button.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { formatRelative } from '../../utils/formatDate.js';

const QUICK_PROMPTS = [
  'Why am I weak at Dynamic Programming?',
  'What should I practice today?',
  'Analyze my latest contest.',
  'Create a 7-day DSA plan for me.',
  'What should I improve next?',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${isUser ? 'bg-[#6366f1]/20 text-[#818cf8]' : 'bg-[#8b5cf6]/20 text-[#a78bfa]'}`}>
        {isUser ? 'U' : 'AI'}
      </div>
      <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'bg-[#6366f1] text-white rounded-tr-sm' : 'bg-[#161820] text-[#e8eaf0] border border-[#1e2030] rounded-tl-sm'}`}>
        {msg.thinking && (
          <div className="flex items-center gap-2 text-[#6b7280] text-xs mb-2">
            <span className="flex gap-0.5">
              <span className="w-1 h-1 bg-[#6b7280] rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
              <span className="w-1 h-1 bg-[#6b7280] rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
              <span className="w-1 h-1 bg-[#6b7280] rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
            </span>
            AI is thinking…
          </div>
        )}
        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
        {msg.error && <p className="text-[#ef4444] text-xs mt-1">{msg.error}</p>}
      </div>
    </div>
  );
}

export default function AICoachPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const messagesEndRef = useRef(null);
  const { toast } = useApp();

  useEffect(() => {
    aiApi.getConversations()
      .then(d => { setConversations(d?.conversations || []); setLoadingConvs(false); })
      .catch(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const newConversation = async () => {
    try {
      const d = await aiApi.createConversation({ title: 'New Conversation' });
      const conv = d?.conversation || { id: Date.now(), title: 'New Conversation', createdAt: new Date() };
      setConversations(c => [conv, ...c]);
      setActiveConvId(conv.id);
      setMessages([]);
      return conv.id;
    } catch {
      toast.error('Failed to create conversation.');
      return null;
    }
  };

  const sendMessage = async (text, conversationId = activeConvId) => {
    const userMsg = text || input.trim();
    if (!userMsg || sending) return;
    setInput('');
    setSending(true);

    setMessages(m => [...m, { role: 'user', content: userMsg }]);
    setMessages(m => [...m, { role: 'assistant', thinking: true }]);

    try {
      const d = await aiApi.chat({ conversationId, message: userMsg });
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'assistant', content: d?.response || 'No response received.' };
        return copy;
      });
    } catch (err) {
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'assistant', error: 'AI service unavailable. Please try again.', content: '' };
        return copy;
      });
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async () => {
    try {
      await aiApi.deleteConversation(deleteTarget);
      setConversations(c => c.filter(x => x.id !== deleteTarget));
      if (activeConvId === deleteTarget) { setActiveConvId(null); setMessages([]); }
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete conversation.');
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-56 border-r border-[#1e2030] bg-[#0d0e14]">
        <div className="p-3 border-b border-[#1e2030]">
          <Button variant="secondary" size="sm" className="w-full" onClick={newConversation}>+ New Chat</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConvs ? (
            <div className="space-y-1">{[1,2,3].map(i => <div key={i} className="h-8 bg-[#1a1c2a] animate-pulse rounded" />)}</div>
          ) : conversations.length ? (
            conversations.map(c => (
              <div key={c.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group transition-colors ${activeConvId === c.id ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'text-[#9ca3c4] hover:bg-[#1a1c2a] hover:text-[#e8eaf0]'}`}
                onClick={async () => {
                  try {
                    const d = await aiApi.getConversation(c.id);
                    setActiveConvId(c.id);
                    setMessages(d?.messages || []);
                  } catch {
                    toast.error('Failed to load conversation.');
                  }
                }}
              >
                <span className="flex-1 text-xs truncate">{c.title}</span>
                <button onClick={e => { e.stopPropagation(); setDeleteTarget(c.id); }}
                  className="opacity-0 group-hover:opacity-100 text-[#6b7280] hover:text-[#ef4444] text-xs transition-all">×</button>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#6b7280] px-2 py-4 text-center">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {!activeConvId && !messages.length ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[#e8eaf0]">AI Coach</h3>
                <p className="text-sm text-[#6b7280] mt-1 max-w-xs">Ask anything about your Codeforces performance. Your AI coach uses your real data to give personalized guidance.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 w-full max-w-md">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={async () => {
                    if (!activeConvId) {
                      const id = await newConversation();
                      if (id) await sendMessage(p, id);
                    } else {
                      await sendMessage(p, activeConvId);
                    }
                  }}
                    className="text-left text-xs p-3 bg-[#111218] border border-[#1e2030] rounded-lg hover:border-[#252840] text-[#9ca3c4] hover:text-[#e8eaf0] transition-colors">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[#1e2030] p-4">
          <form onSubmit={async e => {
            e.preventDefault();
            if (!input.trim() || sending) return;
            if (!activeConvId) {
              const id = await newConversation();
              if (id) await sendMessage(input, id);
            } else {
              await sendMessage(input, activeConvId);
            }
          }}
            className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask your AI Coach…"
              disabled={sending}
              className="flex-1 bg-[#111218] border border-[#1e2030] rounded-lg px-4 py-2.5 text-sm text-[#e8eaf0] placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-colors"
            />
            <Button type="submit" loading={sending} disabled={!input.trim() && !sending}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </form>
          <p className="text-[10px] text-[#4b5563] mt-2">AI responses are based on your actual Codeforces data via the backend AI pipeline.</p>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteConversation}
        title="Delete Conversation"
        description="This conversation will be permanently deleted."
        confirmLabel="Delete"
      />
    </div>
  );
}
