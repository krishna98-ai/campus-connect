import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Send, MessageSquare, Search, Loader2, ArrowLeft, CheckCheck } from 'lucide-react';
import api from '../api/axiosInstance';
import Avatar from '../components/common/Avatar';
import { getSocket } from '../socket/socket';
import { formatTime, formatRelative } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState({});
  const [searchUsers, setSearchUsers] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // Load conversations
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/chat/conversations');
        setConversations(res.data.conversations || []);
      } catch (_) {}
      setLoading(false);
    };
    fetch();
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!conversationId) return;
    const conv = conversations.find((c) => c._id === conversationId);
    if (conv) setActiveConv(conv);
    const fetchMsgs = async () => {
      setMsgLoading(true);
      try {
        const res = await api.get(`/chat/conversations/${conversationId}/messages?limit=50`);
        setMessages(res.data.data || []);
      } catch (_) {}
      setMsgLoading(false);
    };
    fetchMsgs();
  }, [conversationId, conversations]);

  // Socket events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (conversationId) socket.emit('join_conversation', conversationId);

    const handleNewMessage = ({ message, conversationId: cId }) => {
      if (cId === conversationId) {
        setMessages((prev) => [...prev, message]);
        setConversations((prev) =>
          prev.map((c) => c._id === cId ? { ...c, lastMessage: message, lastMessageAt: message.createdAt } : c)
        );
      } else {
        setConversations((prev) =>
          prev.map((c) => c._id === cId ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMessage: message } : c)
        );
      }
    };

    const handleTyping = ({ userId: uid, isTyping: t, conversationId: cId }) => {
      if (cId !== conversationId) return;
      setTyping((prev) => ({ ...prev, [uid]: t }));
      if (t) {
        clearTimeout(typingTimeoutRef.current[uid]);
        typingTimeoutRef.current[uid] = setTimeout(() => {
          setTyping((prev) => ({ ...prev, [uid]: false }));
        }, 3000);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);

    return () => {
      if (conversationId) socket.emit('leave_conversation', conversationId);
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
    };
  }, [conversationId]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTypingEmit = useCallback(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return;
    socket.emit('typing', { conversationId, isTyping: true });
    clearTimeout(typingTimeoutRef.current.self);
    typingTimeoutRef.current.self = setTimeout(() => {
      socket.emit('typing', { conversationId, isTyping: false });
    }, 2000);
  }, [conversationId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim() || !conversationId) return;
    setSending(true);
    try {
      const res = await api.post(`/chat/conversations/${conversationId}/messages`, { text: msgText.trim() });
      setMessages((prev) => [...prev, res.data.message]);
      setMsgText('');
      setConversations((prev) =>
        prev.map((c) => c._id === conversationId ? { ...c, lastMessage: res.data.message, lastMessageAt: new Date() } : c)
      );
    } catch {
      toast.error('Failed to send message');
    }
    setSending(false);
  };

  const startConversation = async (userId) => {
    try {
      const res = await api.post('/chat/conversations', { userId });
      const conv = res.data.conversation;
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === conv._id);
        return exists ? prev : [conv, ...prev];
      });
      navigate(`/chat/${conv._id}`);
      setShowUserSearch(false);
    } catch {
      toast.error('Could not start conversation');
    }
  };

  const searchForUsers = async (q) => {
    if (!q.trim()) { setUserResults([]); return; }
    try {
      const res = await api.get('/users/search', { params: { q } });
      setUserResults(res.data.users?.filter((u) => u._id !== user?._id) || []);
    } catch (_) {}
  };

  const getOtherParticipant = (conv) => conv.participants?.find((p) => p._id !== user?._id) || conv.participants?.[0];

  const typingUsers = Object.entries(typing).filter(([uid, t]) => t && uid !== user?._id);

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-0 card overflow-hidden">
      {/* Conversation list */}
      <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">Messages</h2>
            <button onClick={() => setShowUserSearch((p) => !p)} className="btn-primary px-3 py-1.5 text-xs">
              + New
            </button>
          </div>

          {showUserSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchUsers}
                onChange={(e) => { setSearchUsers(e.target.value); searchForUsers(e.target.value); }}
                placeholder="Search users..."
                className="input-field pl-10 text-sm"
                autoFocus
              />
              {userResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-elevated z-10 overflow-hidden">
                  {userResults.map((u) => (
                    <button key={u._id} onClick={() => startConversation(u._id)} className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <Avatar user={u} size="xs" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{u.name}</p>
                        <p className="text-xs text-slate-500">@{u.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && [1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-4 animate-pulse">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3.5 w-24 rounded" />
                <div className="skeleton h-3 w-32 rounded" />
              </div>
            </div>
          ))}

          {!loading && conversations.length === 0 && (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No conversations yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "+ New" to start chatting</p>
            </div>
          )}

          {conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const isActive = conv._id === conversationId;
            return (
              <button
                key={conv._id}
                onClick={() => navigate(`/chat/${conv._id}`)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors relative ${isActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
              >
                <div className="relative">
                  <Avatar user={other} size="sm" />
                  {other?.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{other?.name}</p>
                    {conv.lastMessageAt && (
                      <span className="text-xs text-slate-400 shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {conv.lastMessage?.text || 'Start a conversation'}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Message area */}
      <div className={`flex-1 flex flex-col ${!conversationId ? 'hidden md:flex' : 'flex'}`}>
        {!conversationId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-600 dark:text-slate-400">Select a conversation</p>
              <p className="text-sm text-slate-400">Choose from your chats or start a new one</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            {activeConv && (() => {
              const other = getOtherParticipant(activeConv);
              return (
                <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
                  <button onClick={() => navigate('/chat')} className="md:hidden btn-ghost p-2">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <Avatar user={other} size="sm" />
                    {other?.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{other?.name}</p>
                    <p className="text-xs text-slate-500">
                      {other?.isOnline ? 'Active now' : `Last seen ${formatRelative(other?.lastSeen)}`}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgLoading && (
                <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-400" /></div>
              )}

              {messages.map((msg, i) => {
                const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                const showAvatar = !isMine && (i === 0 || messages[i - 1]?.sender?._id !== msg.sender?._id);
                return (
                  <div key={msg._id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                    {!isMine && (showAvatar ? <Avatar user={msg.sender} size="xs" /> : <div className="w-6" />)}
                    <div className={`max-w-[70%] space-y-1 ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-primary-500 text-white rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                      } ${msg.isDeleted ? 'italic opacity-60' : ''}`}>
                        {msg.image?.url && <img src={msg.image.url} alt="" className="rounded-xl max-w-48 mb-1" />}
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${isMine ? 'flex-row-reverse' : ''}`}>
                        <span>{formatTime(msg.createdAt)}</span>
                        {isMine && <CheckCheck className={`w-3 h-3 ${msg.isRead ? 'text-primary-400' : ''}`} />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Message input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <input
                value={msgText}
                onChange={(e) => { setMsgText(e.target.value); handleTypingEmit(); }}
                placeholder="Type a message..."
                className="input-field flex-1"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
              />
              <button type="submit" disabled={sending || !msgText.trim()} className="btn-primary px-4">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
