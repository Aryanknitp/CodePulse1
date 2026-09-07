import crypto from 'node:crypto';

export function randomNumericOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function randomCode(prefix = 'CFI') {
  return `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}
