import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Send,
  MessageSquare,
  Search,
  Loader2,
  ArrowLeft,
  CheckCheck,
  ImagePlus,
  X,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../api/axiosInstance";
import Avatar from "../components/common/Avatar";
import { getSocket } from "../socket/socket";
import { formatTime, formatRelative } from "../utils/helpers";

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  const [msgText, setMsgText] = useState("");
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [typing, setTyping] = useState({});
  const [searchUsers, setSearchUsers] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // Get current conversation
  const activeConversation = conversations.find(
    (conversation) => conversation._id === conversationId,
  );

  // Get other person from conversation
  const getOtherUser = (conversation) => {
    return (
      conversation?.participants?.find((person) => person._id !== user?._id) ||
      conversation?.participants?.[0]
    );
  };

  // Load conversations
  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await api.get("/chat/conversations");
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
          `/chat/conversations/${conversationId}/messages?limit=50`,
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
      socket.emit("join_conversation", conversationId);
    }

    const handleNewMessage = ({ message, conversationId: id }) => {
      if (id === conversationId) {
        setMessages((prev) => {
          const exists = prev.some((item) => item._id === message._id);

          if (exists) return prev;

          return [...prev, message];
        });

        setConversations((prev) =>
          prev.map((conversation) =>
            conversation._id === id
              ? {
                  ...conversation,
                  lastMessage: message,
                  lastMessageAt: message.createdAt,
                }
              : conversation,
          ),
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
              : conversation,
          ),
        );
      }
    };

    const handleTyping = ({ userId, isTyping, conversationId: id }) => {
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

    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);

    return () => {
      if (conversationId) {
        socket.emit("leave_conversation", conversationId);
      }

      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
    };
  }, [conversationId]);

  // Scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  //handle images add
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      e.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  //handle remove image
  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");
  };
  // Send typing event
  const handleTyping = () => {
    const socket = getSocket();

    if (!socket || !conversationId) return;

    socket.emit("typing", {
      conversationId,
      isTyping: true,
    });

    clearTimeout(typingTimeoutRef.current.self);

    typingTimeoutRef.current.self = setTimeout(() => {
      socket.emit("typing", {
        conversationId,
        isTyping: false,
      });
    }, 2000);
  };

  // Send message
  const sendMessage = async (event) => {
    event.preventDefault();

    const text = msgText.trim();

    if ((!text && !selectedImage) || !conversationId) return;

    setSending(true);

    try {
      const formData = new FormData();

      if (text) {
        formData.append("text", text);
      }

      if (selectedImage) {
        formData.append("image", selectedImage);
      }
      const res = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        formData,
      );

      const message = res.data.message;

      setMessages((prev) => {
        const exists = prev.some((item) => item._id === message._id);

        if (exists) return prev;

        return [...prev, message];
      });
      setMsgText("");
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setSelectedImage(null);
      setImagePreview("");

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                lastMessage: message,
                lastMessageAt: new Date(),
              }
            : conversation,
        ),
      );
    } catch (error) {
      console.error("Send message failed:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  //handle delete messgae
  const handleDeleteMessage = async (messageId) => {
    const confirmed = window.confirm("Delete this message for everyone?");

    if (!confirmed) return;

    try {
      await api.delete(`/chat/messages/${messageId}`);

      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId
            ? {
                ...message,
                isDeleted: true,
                text: "This message was deleted",
                image: null,
              }
            : message,
        ),
      );

      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  };

  // Start new conversation
  const startConversation = async (userId) => {
    try {
      const res = await api.post("/chat/conversations", {
        userId,
      });

      const conversation = res.data.conversation;

      setConversations((prev) => {
        const alreadyExists = prev.some(
          (item) => item._id === conversation._id,
        );

        if (alreadyExists) {
          return prev;
        }

        return [conversation, ...prev];
      });

      navigate(`/chat/${conversation._id}`);
      setShowUserSearch(false);
      setSearchUsers("");
      setUserResults([]);
    } catch (error) {
      toast.error("Could not start conversation");
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
      const res = await api.get("/users/search", {
        params: {
          q: value,
        },
      });

      const users = res.data.users || [];

      setUserResults(users.filter((item) => item._id !== user?._id));
    } catch (error) {
      setUserResults([]);
    }
  };

  const typingUsers = Object.entries(typing).filter(
    ([userId, isTyping]) => isTyping && userId !== user?._id,
  );

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* Conversations */}
      <div
        className={`w-full border-r border-slate-200 dark:border-slate-700 md:w-80 md:flex ${
          conversationId ? "hidden" : "flex"
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
              <div key={item} className="flex animate-pulse gap-3 p-4">
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

              <p className="text-sm text-slate-500">No conversations yet</p>

              <p className="mt-1 text-xs text-slate-400">
                Click "+ New" to start chatting
              </p>
            </div>
          )}

          {conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const isActive = conversation._id === conversationId;

            return (
              <button
                key={conversation._id}
                onClick={() => navigate(`/chat/${conversation._id}`)}
                className={`relative flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  isActive ? "bg-primary-50 dark:bg-primary-900/20" : ""
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
                    {conversation.lastMessage?.text || "Start a conversation"}
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
          conversationId ? "flex" : "hidden md:flex"
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
                  onClick={() => navigate("/chat")}
                  className="btn-ghost p-2 md:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="relative">
                  <Avatar user={getOtherUser(activeConversation)} size="sm" />

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
                      ? "Active now"
                      : `Last seen ${formatRelative(
                          getOtherUser(activeConversation)?.lastSeen,
                        )}`}
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}

            <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
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
                    (previousMessage.sender?._id ?? previousMessage.sender) !==
                      (message.sender?._id ?? message.sender));

                return (
                  <div
                    key={message._id}
                    className={`group flex w-full min-w-0 items-end gap-2 ${
                      isMine ? "flex-row-reverse" : ""
                    }`}
                  >
                    {!isMine &&
                      (showAvatar ? (
                        <div className="w-6 shrink-0">
                          <Avatar user={message.sender} size="xs" />
                        </div>
                      ) : (
                        <div className="w-6 shrink-0" />
                      ))}

                    <div
                      className={`flex min-w-0 flex-1 items-end gap-2 ${
                        isMine ? "flex-row-reverse" : ""
                      }`}
                    >
                      {/* Message bubble */}
                      <div
                        className={`flex min-w-0 max-w-[calc(100%-2.5rem)] flex-col space-y-1 sm:max-w-[80%] ${
                          isMine ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`min-w-0 max-w-full overflow-hidden rounded-xl px-3 py-2.5 text-sm leading-relaxed break-words [overflow-wrap:anywhere] sm:px-4 ${
                            isMine
                              ? "rounded-br-sm bg-primary-500 text-white"
                              : "rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                          } ${message.isDeleted ? "italic opacity-60" : ""}`}
                        >
                          {message.isDeleted ? (
                            "This message was deleted"
                          ) : (
                            <>
                              {message.image?.url && (
                                <img
                                  src={message.image.url}
                                  alt="Chat attachment"
                                  className="mb-2 h-auto max-h-72 w-auto max-w-full rounded-lg object-contain"
                                />
                              )}

                              {message.text && (
                                <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                  {message.text}
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div
                          className={`flex items-center gap-1 text-[10px] text-slate-400 ${
                            isMine ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span>{formatTime(message.createdAt)}</span>

                          {isMine && (
                            <CheckCheck
                              className={`h-3 w-3 shrink-0 ${
                                message.isRead ? "text-primary-400" : ""
                              }`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Delete button: always visible on mobile */}
                      {isMine && !message.isDeleted && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(message._id)}
                          title="Delete for everyone"
                          aria-label="Delete message for everyone"
                          className="mb-5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-950 dark:hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {typingUsers.length > 0 && (
                <div className="flex items-end gap-2">
                  <div className="inline-flex gap-1 rounded-xl rounded-bl-sm bg-slate-100 px-4 py-2.5 dark:bg-slate-700">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "0.3s" }}
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
              {imagePreview && (
                <div className="relative mb-3 w-fit">
                  <img
                    src={imagePreview}
                    alt="Selected image preview"
                    className="h-24 w-24 rounded-xl border object-cover"
                  />

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -right-2 -top-2 rounded-full bg-black p-1 text-white"
                    aria-label="Remove selected image"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <input
                value={msgText}
                onChange={(e) => {
                  setMsgText(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
                className="input-field flex-1"
              />
              <label
                className="cursor-pointer rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Attach image"
              >
                <ImagePlus size={20} />

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
              <button
                type="submit"
                disabled={sending || (!msgText.trim() && !selectedImage)}
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
