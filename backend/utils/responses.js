// Common response utilities to follow DRY principle

const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, additionalFields = {}) => {
  const response = { success: true };
  
  if (message) response.message = message;
  if (data !== null) {
    // If data is an object with specific fields, spread them into response
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }
  
  // Add any additional fields
  Object.assign(response, additionalFields);
  
  return res.status(statusCode).json(response);
};

const sendError = (res, error = 'Internal server error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error
  });
};

const sendValidationError = (res, error = 'Validation failed') => {
  return sendError(res, error, 400);
};

const sendUnauthorized = (res, error = 'Not authenticated') => {
  return sendError(res, error, 401);
};

const sendForbidden = (res, error = 'Access forbidden') => {
  return sendError(res, error, 403);
};

const sendNotFound = (res, error = 'Resource not found') => {
  return sendError(res, error, 404);
};

const sendConflict = (res, error = 'Resource already exists') => {
  return sendError(res, error, 409);
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict
};