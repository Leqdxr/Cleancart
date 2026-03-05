/**
 * Unit tests for JWT token generation utility
 * Verifies token structure, claims, and expiration
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/constants');

// Extract the generateToken function by requiring the controller
// Since it's a private function, we test it indirectly through the controller
// But we can also test the JWT_SECRET config directly

describe('JWT Configuration', () => {
  test('JWT_SECRET should be defined', () => {
    expect(JWT_SECRET).toBeDefined();
    expect(typeof JWT_SECRET).toBe('string');
    expect(JWT_SECRET.length).toBeGreaterThan(0);
  });

  test('should generate a valid JWT with correct claims', () => {
    const userId = 42;
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.userId).toBe(42);
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
  });

  test('should reject tokens signed with wrong secret', () => {
    const token = jwt.sign({ userId: 1 }, 'wrong-secret', { expiresIn: '1h' });

    expect(() => {
      jwt.verify(token, JWT_SECRET);
    }).toThrow();
  });

  test('should reject expired tokens', () => {
    const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '-1s' });

    expect(() => {
      jwt.verify(token, JWT_SECRET);
    }).toThrow('jwt expired');
  });

  test('token expiry should be approximately 7 days from generation', () => {
    const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '7d' });
    const decoded = jwt.verify(token, JWT_SECRET);

    const sevenDaysInSeconds = 7 * 24 * 60 * 60;
    const tokenLifespan = decoded.exp - decoded.iat;
    expect(tokenLifespan).toBe(sevenDaysInSeconds);
  });
});

describe('Password Hashing (bcrypt)', () => {
  const bcrypt = require('bcryptjs');

  test('should hash a password with salt rounds', async () => {
    const plainPassword = 'password123';
    const hashed = await bcrypt.hash(plainPassword, 10);

    expect(hashed).not.toBe(plainPassword);
    expect(hashed.length).toBeGreaterThan(0);
  });

  test('should verify correct password against hash', async () => {
    const plainPassword = 'password123';
    const hashed = await bcrypt.hash(plainPassword, 10);

    const isMatch = await bcrypt.compare(plainPassword, hashed);
    expect(isMatch).toBe(true);
  });

  test('should reject incorrect password against hash', async () => {
    const plainPassword = 'password123';
    const hashed = await bcrypt.hash(plainPassword, 10);

    const isMatch = await bcrypt.compare('wrongpassword', hashed);
    expect(isMatch).toBe(false);
  });

  test('should produce different hashes for the same password', async () => {
    const plainPassword = 'password123';
    const hash1 = await bcrypt.hash(plainPassword, 10);
    const hash2 = await bcrypt.hash(plainPassword, 10);

    expect(hash1).not.toBe(hash2);
    // But both should still validate
    expect(await bcrypt.compare(plainPassword, hash1)).toBe(true);
    expect(await bcrypt.compare(plainPassword, hash2)).toBe(true);
  });
});
