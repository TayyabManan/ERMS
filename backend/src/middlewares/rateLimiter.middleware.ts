import rateLimit from 'express-rate-limit';

// Strict rate limiter for login - prevents brute force attacks
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
    error: { code: 'RATE_LIMIT_EXCEEDED' },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limiter for registration - prevents spam
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour per IP
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again later.',
    error: { code: 'RATE_LIMIT_EXCEEDED' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for token refresh - prevents token abuse
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 refreshes per window
  message: {
    success: false,
    message: 'Too many token refresh requests. Please try again later.',
    error: { code: 'RATE_LIMIT_EXCEEDED' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    error: { code: 'RATE_LIMIT_EXCEEDED' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
