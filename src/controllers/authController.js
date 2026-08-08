const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
const TOKEN_TTL = '7d';

class AuthController {
  static async register(req, res) {
    const { fullName, email, password, phone } = req.body;
    
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email and password are required.' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    
    try {
      const user = User.create({ fullName, email, password, phone });
      res.status(201).json({ 
        user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone } 
      });
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      console.error(err);
      res.status(500).json({ error: 'Could not create your account. Try again.' });
    }
  }
  
  static async login(req, res) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    
    const user = User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    
    const valid = User.verifyPassword(user, password);
    
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: TOKEN_TTL });
    
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ 
      user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone } 
    });
  }
  
  static logout(req, res) {
    res.clearCookie('token');
    res.json({ ok: true });
  }
  
  static me(req, res) {
    const user = User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    res.json({ 
      user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone } 
    });
  }
}

module.exports = AuthController;
