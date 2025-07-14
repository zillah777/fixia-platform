const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const sanitizeUser = (user) => {
  const { password_hash, ...sanitized } = user;
  return sanitized;
};

const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset };
};

const formatResponse = (data, message = 'Éxito', success = true) => {
  return {
    success,
    message,
    data
  };
};

const formatError = (message = 'Error interno del servidor', details = null) => {
  return {
    success: false,
    error: message,
    ...(details && { details })
  };
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const isValidTimeSlot = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  const startTime = 8 * 60;  // 8:00 AM
  const endTime = 20 * 60;   // 8:00 PM
  
  return timeInMinutes >= startTime && timeInMinutes <= endTime;
};

const isValidDate = (date) => {
  const today = new Date();
  const selectedDate = new Date(date);
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);
  
  return selectedDate >= today && selectedDate <= maxDate;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRandomString,
  formatCurrency,
  calculateDistance,
  sanitizeUser,
  paginate,
  formatResponse,
  formatError,
  generateSlug,
  isValidTimeSlot,
  isValidDate
};