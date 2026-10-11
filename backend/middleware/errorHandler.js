const errorHandler = (err, req, res, next) => {
let statusCode = err.statusCode || 500;
let message = err.message || 'Internal Server Error';

// Handle invalid MongoDB ID
if (err.name === 'CastError') {
message = `Resource not found with id: ${err.value}`;
statusCode = 404;
}

// Handle duplicate values
if (err.code === 11000) {
const field = Object.keys(err.keyValue)[0];
message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists;`
statusCode = 409;
}

// Handle MongoDB validation errors
if (err.name === 'ValidationError') {
message = Object.values(err.errors)
.map((error) => error.message)
.join(', ');
statusCode = 400;
}

// Handle JWT errors
if (err.name === 'JsonWebTokenError') {
message = 'Invalid authentication token';
statusCode = 401;
}

if (err.name === 'TokenExpiredError') {
message = 'Session expired, please log in again';
statusCode = 401;
}

// Handle file upload errors
if (err.code === 'LIMIT_FILE_SIZE') {
message = 'File size too large';
statusCode = 400;
}

if (err.code === 'LIMIT_UNEXPECTED_FILE') {
message = 'Unexpected file field';
statusCode = 400;
}

if (process.env.NODE_ENV === 'development') {
console.error('ERROR:', err);
}

res.status(statusCode).json({
success: false,
message,
...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
});
};

export default errorHandler;