const sendSuccess = (res, statusCode = 200, message = "Success", data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const sendPaginated = (
  res,
  statusCode = 200,
  message = "Success",
  data,
  pagination,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
};
const getPaginationParams = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 50) limit = 50;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

export {
  sendSuccess,
  createError,
  sendPaginated,
  getPaginationParams,
  buildPaginationMeta,
};
