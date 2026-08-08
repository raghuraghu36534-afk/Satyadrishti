/*
 * Minimal file-backed user store.
 * Swap this module for a real database (Postgres, MySQL, MongoDB, etc.)
 * in production -- the function signatures are the integration contract
 * the rest of the app relies on.
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'users.json');

function ensureFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]', 'utf8');
}

function readUsers() {
  ensureFile();
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  ensureFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), 'utf8');
}

function findByEmail(email) {
  const needle = email.toLowerCase();
  return readUsers().find((u) => u.email.toLowerCase() === needle) || null;
}

function findById(id) {
  return readUsers().find((u) => u.id === id) || null;
}

function insertUser(user) {
  const users = readUsers();
  users.push(user);
  writeUsers(users);
  return user;
}

module.exports = { readUsers, writeUsers, findByEmail, findById, insertUser };
