import { Message, Conversation } from '../models/Message.js';
import  User  from '../models/User.js';
import  { sendSuccess, createError, getPaginationParams, buildPaginationMeta, sendPaginated } from '../utils/apiResponse.js';
import { getIO, getOnlineUsers }  from '../socket/index.js';

// @desc    Get or create conversation between two users
// @route   POST /api/chat/conversations
// @access  Private
export const getOrCreateConversation = async (req, res, next) => {w
  try {
    const { userId } = req.body;
    if (!userId) return next(createError('userId is required', 400));
    if (userId === req.user._id.toString()) return next(createError('Cannot chat with yourself', 400));

    const otherUser = await User.findById(userId);
    if (!otherUser) return next(createError('User not found', 404));

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId], $size: 2 },
    }).populate('participants', 'name username avatar lastSeen');

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user.id, userId] });
      await conversation.populate('participants', 'name username avatar lastSeen');
    }

    const onlineUsers = getOnlineUsers();
    const convObj = conversation.toObject();
    convObj.participants = convObj.participants.map((p) => ({
      ...p,
      isOnline: onlineUsers.has(p._id.toString()),
    }));

    sendSuccess(res, 200, 'Conversation ready', { conversation: convObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "name username avatar lastSeen")
      .populate("lastMessage")
      .lean();

    const onlineUsers = getOnlineUsers();

    const enriched = conversations.map((conv) => ({
      ...conv,
      participants: conv.participants.map((p) => ({
        ...p,
        isOnline: onlineUsers.has(p._id.toString()),
      })),
      unreadCount: conv.unreadCount ? conv.unreadCount[req.user.id] || 0 : 0,
    }));

    sendSuccess(res, 200, "Conversations fetched", { conversations: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/chat/conversations/:conversationId/messages
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return next(createError("Conversation not found", 404));

    if (
      !conversation.participants.some(
        (p) => p.toString() === req.user._id.toString(),
      )
    ) {
      return next(createError("Not authorized to view this conversation", 403));
    }

    const [messages, total] = await Promise.all([
      Message.find({
        conversation: req.params.conversationId,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name username avatar")
        .lean(),
      Message.countDocuments({
        conversation: req.params.conversationId,
        isDeleted: false,
      }),
    ]);

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      { isRead: true, readAt: new Date() },
    );

    // Reset unread count
    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      $set: { [`unreadCount.${req.user._id}`]: 0 },
    });

    sendPaginated(
      res,
      200,
      "Messages fetched",
      messages.reverse(),
      buildPaginationMeta(total, page, limit),
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/chat/conversations/:conversationId/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text && !req.file)
      return next(createError("Message text is required", 400));

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return next(createError("Conversation not found", 404));

    if (
      !conversation.participants.some(
        (p) => p.toString() === req.user._id.toString(),
      )
    ) {
      return next(
        createError("Not authorized to send to this conversation", 403),
      );
    }

    const msgData = {
      conversation: req.params.conversationId,
      sender: req.user._id,
      text: text || "",
    };

    if (req.file) {
      msgData.image = { public_id: req.file.filename, url: req.file.path };
    }

    const message = await Message.create(msgData);
    await message.populate("sender", "name username avatar");

    // Update conversation's last message and unread count
    const otherParticipant = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString(),
    );

    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      $inc: {
        [`unreadCount.${otherParticipant?.toString?.() || otherParticipant}`]: 1,
      },
    });

    // Emit via socket
    const io = getIO();
    if (io) {
      conversation.participants.forEach((participantId) => {
        io.to(participantId.toString()).emit("new_message", {
          message,
          conversationId: req.params.conversationId,
        });
      });
    }

    sendSuccess(res, 201, "Message sent", { message });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/messages/:messageId
// @access  Private
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return next(createError("Message not found", 404));

    if (message.sender.toString() !== req.user.id) {
      return next(createError("Not authorized to delete this message", 403));
    }

    message.isDeleted = true;
    message.text = "This message was deleted";
    await message.save();

    sendSuccess(res, 200, "Message deleted");
  } catch (error) {
    next(error);
  }
};
