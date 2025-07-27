// Validation utilities to follow DRY principle

const validateRequired = (fields, data) => {
  const missing = [];
  
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  
  return null;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password, minLength = 1) => {
  if (!password || password.length < minLength) {
    return `Password must be at least ${minLength} character(s)`;
  }
  return null;
};

const validateUserIds = (userIds) => {
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return 'User IDs are required and must be a non-empty array';
  }
  return null;
};

module.exports = {
  validateRequired,
  validateEmail,
  validatePassword,
  validateUserIds
};