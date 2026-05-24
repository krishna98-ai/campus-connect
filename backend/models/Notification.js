const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['like', 'comment', 'reply', 'follow', 'note_like', 'note_download', 'mention', 'message'],
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', default: null },
    message: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
