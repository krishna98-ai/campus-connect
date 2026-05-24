const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
} = require('../controllers/chatController');

router.post('/conversations', protect, getOrCreateConversation);
router.get('/conversations', protect, getConversations);
router.get('/conversations/:conversationId/messages', protect, getMessages);
router.post('/conversations/:conversationId/messages', protect, sendMessage);
router.delete('/messages/:messageId', protect, deleteMessage);

module.exports = router;
