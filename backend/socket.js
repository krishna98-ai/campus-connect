const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie?.split('token=')[1]?.split(';')[0];

      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name username avatar');
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: ${socket.user.username} (${socket.id})`);

    // Register user as online
    onlineUsers.set(userId, socket.id);
    socket.join(userId); // Personal room for notifications

    // Broadcast online status to all connected clients
    io.emit('user_online', { userId, isOnline: true });

    // Update last seen
    User.findByIdAndUpdate(userId, { lastSeen: new Date() }).exec();

    // Handle joining conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conv_${conversationId}`).emit('typing', {
        userId,
        username: socket.user.username,
        isTyping,
        conversationId,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.username}`);
      onlineUsers.delete(userId);
      io.emit('user_online', { userId, isOnline: false });

      User.findByIdAndUpdate(userId, { lastSeen: new Date() }).exec();
    });
  });

  return io;
};

const getIO = () => io;
const getOnlineUsers = () => onlineUsers;

module.exports = { initSocket, getIO, getOnlineUsers };
