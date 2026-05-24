const Notification = require('../models/Notification');
const { sendSuccess, getPaginationParams, buildPaginationMeta, sendPaginated } = require('../utils/apiResponse');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name username avatar')
        .populate('post', 'content')
        .lean(),
      Notification.countDocuments({ recipient: req.user.id }),
      Notification.countDocuments({ recipient: req.user.id, isRead: false }),
    ]);

    sendPaginated(res, 200, 'Notifications fetched', notifications, {
      ...buildPaginationMeta(total, page, limit),
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification(s) as read
// @route   PUT /api/notifications/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const { ids } = req.body; // Array of IDs or 'all'

    if (ids === 'all') {
      await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true, readAt: new Date() });
    } else if (Array.isArray(ids) && ids.length > 0) {
      await Notification.updateMany(
        { _id: { $in: ids }, recipient: req.user.id },
        { isRead: true, readAt: new Date() }
      );
    }

    sendSuccess(res, 200, 'Notifications marked as read');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });
    sendSuccess(res, 200, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    sendSuccess(res, 200, 'Unread count', { count });
  } catch (error) {
    next(error);
  }
};
