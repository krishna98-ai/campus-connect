// Standard success response
exports.sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

// Standard error factory
exports.createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Paginated response
exports.sendPaginated = (res, statusCode = 200, message = 'Success', data, pagination) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
};

// Pagination helper
exports.getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

exports.buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});
