
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Send,
  MessageSquare,
  Search,
  Loader2,
  ArrowLeft,
  CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../api/axiosInstance';
import Avatar from '../components/common/Avatar';
import { getSocket } from '../socket/socket';
import { formatTime, formatRelative } from '../utils/helpers';

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

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

  // Get current conversation
  const activeConversation = conversations.find(
    (conversation) => conversation._id === conversationId
  );

  // Get other person from conversation
  const getOtherUser = (conversation) => {
    return (
      conversation?.participants?.find(
        (person) => person._id !== user?._id
      ) || conversation?.participants?.[0]
    );
  };

  // Load conversations
  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        setConversations(res.data.conversations || []);
      } catch (error) {
        // Keep page usable even if conversations fail
      }

      setLoading(false);
    };

    getConversations();
  }, []);

  // Load messages
  useEffect(() => {
    if (!conversationId) return;

    const getMessages = async () => {
      setMsgLoading(true);

      try {
        const res = await api.get(
          `/chat/conversations/${conversationId}/messages?limit=50`
        );

        setMessages(res.data.data || []);
      } catch (error) {
        // Keep existing UI
      }

      setMsgLoading(false);
    };

    getMessages();
  }, [conversationId]);

  // Socket setup
  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    if (conversationId) {
      socket.emit('join_conversation', conversationId);
    }

    const handleNewMessage = ({ message, conversationId: id }) => {
      if (id === conversationId) {
        setMessages((prev) => [...prev, message]);

        setConversations((prev) =>
          prev.map((conversation) =>
            conversation._id === id
              ? {
                  ...conversation,
                  lastMessage: message,
                  lastMessageAt: message.createdAt,
                }
              : conversation
          )
        );
      } else {
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation._id === id
              ? {
                  ...conversation,
                  unreadCount: (conversation.unreadCount || 0) + 1,
                  lastMessage: message,
                }
              : conversation
          )
        );
      }
    };

    const handleTyping = ({
      userId,
      isTyping,
      conversationId: id,
    }) => {
      if (id !== conversationId) return;

      setTyping((prev) => ({
        ...prev,
        [userId]: isTyping,
      }));

      if (isTyping) {
        clearTimeout(typingTimeoutRef.current[userId]);

        typingTimeoutRef.current[userId] = setTimeout(() => {
          setTyping((prev) => ({
            ...prev,
            [userId]: false,
          }));
        }, 3000);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);

    return () => {
      if (conversationId) {
        socket.emit('leave_conversation', conversationId);
      }

      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
    };
  }, [conversationId]);

  // Scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  // Send typing event
  const handleTyping = () => {
    const socket = getSocket();

    if (!socket || !conversationId) return;

    socket.emit('typing', {
      conversationId,
      isTyping: true,
    });

    clearTimeout(typingTimeoutRef.current.self);

    typingTimeoutRef.current.self = setTimeout(() => {
      socket.emit('typing', {
        conversationId,
        isTyping: false,
      });
    }, 2000);
  };

  // Send message
  const sendMessage = async (event) => {
    event.preventDefault();

    const text = msgText.trim();

    if (!text || !conversationId) return;

    setSending(true);

    try {
      const res = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        { text }
      );

      const message = res.data.message;

      setMessages((prev) => [...prev, message]);
      setMsgText('');

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                lastMessage: message,
                lastMessageAt: new Date(),
              }
            : conversation
        )
      );
    } catch (error) {
      toast.error('Failed to send message');
    }

    setSending(false);
  };

  // Start new conversation
  const startConversation = async (userId) => {
    try {
      const res = await api.post('/chat/conversations', {
        userId,
      });

      const conversation = res.data.conversation;

      setConversations((prev) => {
        const alreadyExists = prev.some(
          (item) => item._id === conversation._id
        );

        if (alreadyExists) {
          return prev;
        }

        return [conversation, ...prev];
      });

      navigate(`/chat/${conversation._id}`);
      setShowUserSearch(false);
      setSearchUsers('');
      setUserResults([]);
    } catch (error) {
      toast.error('Could not start conversation');
    }
  };

  // Search users
  const searchForUsers = async (value) => {
    setSearchUsers(value);

    if (!value.trim()) {
      setUserResults([]);
      return;
    }

    try {
      const res = await api.get('/users/search', {
        params: {
          q: value,
        },
      });

      const users = res.data.users || [];

      setUserResults(
        users.filter((item) => item._id !== user?._id)
      );
    } catch (error) {
      setUserResults([]);
    }
  };

  const typingUsers = Object.entries(typing).filter(
    ([userId, isTyping]) =>
      isTyping && userId !== user?._id
  );

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">

      {/* Conversations */}
      <div
        className={`w-full border-r border-slate-200 dark:border-slate-700 md:w-80 md:flex ${
          conversationId ? 'hidden' : 'flex'
        } flex-col`}
      >
        <div className="space-y-3 border-b border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Messages
            </h2>

            <button
              onClick={() => setShowUserSearch((prev) => !prev)}
              className="btn-primary px-3 py-1.5 text-xs"
            >
              + New
            </button>
          </div>

          {showUserSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={searchUsers}
                onChange={(e) => searchForUsers(e.target.value)}
                placeholder="Search users..."
                className="input-field pl-10 text-sm"
                autoFocus
              />

              {userResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {userResults.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => startConversation(item._id)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Avatar user={item} size="xs" />

                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {item.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          @{item.username}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading &&
            [1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse gap-3 p-4"
              >
                <div className="skeleton h-10 w-10 rounded-full" />

                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 w-24 rounded" />
                  <div className="skeleton h-3 w-32 rounded" />
                </div>
              </div>
            ))}

          {!loading && conversations.length === 0 && (
            <div className="px-4 py-12 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="text-sm text-slate-500">
                No conversations yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Click "+ New" to start chatting
              </p>
            </div>
          )}

          {conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const isActive =
              conversation._id === conversationId;

            return (
              <button
                key={conversation._id}
                onClick={() =>
                  navigate(`/chat/${conversation._id}`)
                }
                className={`relative flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : ''
                }`}
              >
                <div className="relative">
                  <Avatar user={otherUser} size="sm" />

                  {otherUser?.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {otherUser?.name}
                    </p>

                    {conversation.lastMessageAt && (
                      <span className="ml-2 shrink-0 text-xs text-slate-400">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    )}
                  </div>

                  <p className="truncate text-xs text-slate-500">
                    {conversation.lastMessage?.text ||
                      'Start a conversation'}
                  </p>
                </div>

                {conversation.unreadCount > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                    {conversation.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat */}
      <div
        className={`flex-1 flex-col ${
          conversationId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {!conversationId ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="font-semibold text-slate-600 dark:text-slate-400">
                Select a conversation
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Choose a chat or start a new one
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            {activeConversation && (
              <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
                <button
                  onClick={() => navigate('/chat')}
                  className="btn-ghost p-2 md:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="relative">
                  <Avatar
                    user={getOtherUser(activeConversation)}
                    size="sm"
                  />

                  {getOtherUser(activeConversation)?.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {getOtherUser(activeConversation)?.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {getOtherUser(activeConversation)?.isOnline
                      ? 'Active now'
                      : `Last seen ${formatRelative(
                          getOtherUser(activeConversation)?.lastSeen
                        )}`}
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgLoading && (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
                </div>
              )}

              {messages.map((message, index) => {
                const isMine =
                  message.sender?._id === user?._id ||
                  message.sender === user?._id;

                const previousMessage = messages[index - 1];

                const showAvatar =
                  !isMine &&
                  (!previousMessage ||
                    previousMessage.sender?._id !==
                      message.sender?._id);

                return (
                  <div
                    key={message._id}
                    className={`flex items-end gap-2 ${
                      isMine ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {!isMine &&
                      (showAvatar ? (
                        <Avatar user={message.sender} size="xs" />
                      ) : (
                        <div className="w-6" />
                      ))}

                    <div
                      className={`flex max-w-[70%] flex-col space-y-1 ${
                        isMine ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                          isMine
                            ? 'rounded-br-sm bg-primary-500 text-white'
                            : 'rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                        } ${
                          message.isDeleted
                            ? 'italic opacity-60'
                            : ''
                        }`}
                      >
                        {message.image?.url && (
                          <img
                            src={message.image.url}
                            alt=""
                            className="mb-1 max-w-48 rounded-lg"
                          />
                        )}

                        {message.text}
                      </div>

                      <div
                        className={`flex items-center gap-1 text-[10px] text-slate-400 ${
                          isMine ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <span>
                          {formatTime(message.createdAt)}
                        </span>

                        {isMine && (
                          <CheckCheck
                            className={`h-3 w-3 ${
                              message.isRead
                                ? 'text-primary-400'
                                : ''
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {typingUsers.length > 0 && (
                <div>
                  <div className="inline-flex gap-1 rounded-xl rounded-bl-sm bg-slate-100 px-4 py-2.5 dark:bg-slate-700">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Message input */}
            <form
              onSubmit={sendMessage}
              className="flex gap-3 border-t border-slate-200 p-4 dark:border-slate-700"
            >
              <input
                value={msgText}
                onChange={(e) => {
                  setMsgText(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
                className="input-field flex-1"
              />

              <button
                type="submit"
                disabled={sending || !msgText.trim()}
                className="btn-primary px-4"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
