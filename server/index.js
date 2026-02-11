import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbPromise, { initDb } from './database.js';
import path from 'path'
import dotenv from 'dotenv';
//.env is storing the "supeeeer secret jwt"
const __dirname = import.meta.dirname

const envPath = path.resolve(__dirname, '..','.env');
console.log('Loading .env from:', envPath); // specific log to be sure
dotenv.config({ path: envPath });
const JWT_SECRET = process.env.JWT_SECRET; 
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}
const PORT = process.env.PORT || 3001;
const app = express();


app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// --- AUTH ENDPOINTS ---

app.post('/api/register', async (req, res) => {
  const { username, password, room_number } = req.body;
  const db = await dbPromise;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      'INSERT INTO users (username, password, room_number) VALUES (?, ?, ?)',
      [username, hashedPassword, room_number]
    );
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await dbPromise;
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, room_number: user.room_number },
      JWT_SECRET
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, room_number: user.room_number } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// --- USER MANAGEMENT ENDPOINTS ---

app.get('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const db = await dbPromise;
  const users = await db.all('SELECT id, username, room_number, role FROM users WHERE username != "admin"');
  res.json(users);
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const db = await dbPromise;
  await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'User removed' });
});

// --- COMPLAINT ENDPOINTS ---

app.get('/api/complaints', authenticateToken, async (req, res) => {
  const db = await dbPromise;
  const complaints = await db.all(`
    SELECT c.*, u.username, 
    (SELECT COUNT(*) FROM upvotes WHERE complaint_id = c.id) as upvotes,
    (SELECT 1 FROM upvotes WHERE complaint_id = c.id AND user_id = ?) as has_upvoted
    FROM complaints c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.created_at DESC
  `, [req.user.id]);

  const sanitized = complaints.map(c => ({
    ...c,
    room_number: (c.is_anonymous && req.user.role !== 'admin') ? 'ANON' : c.room_number
  }));

  res.json(sanitized);
});

app.post('/api/complaints', authenticateToken, async (req, res) => {
  const { category, title, description, severity, is_anonymous } = req.body;
  const db = await dbPromise;
  
  await db.run(
    'INSERT INTO complaints (user_id, room_number, category, title, description, severity, is_anonymous) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, req.user.room_number, category, title, description, severity, is_anonymous ? 1 : 0]
  );
  
  res.status(201).json({ message: 'Complaint filed' });
});

app.patch('/api/complaints/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  
  const { status } = req.body;
  const db = await dbPromise;
  const completed_at = status === 'Completed' ? new Date().toISOString() : null;

  await db.run(
    'UPDATE complaints SET status = ?, completed_at = ? WHERE id = ?',
    [status, completed_at, req.params.id]
  );
  
  res.json({ message: 'Status updated' });
});

app.post('/api/complaints/:id/upvote', authenticateToken, async (req, res) => {
  const db = await dbPromise;
  try {
    await db.run(
      'INSERT INTO upvotes (user_id, complaint_id) VALUES (?, ?)',
      [req.user.id, req.params.id]
    );
    res.json({ message: 'Upvoted' });
  } catch (error) {
    res.status(400).json({ error: 'Already upvoted' });
  }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
  const db = await dbPromise;
  
  const activeCount = await db.get("SELECT COUNT(*) as count FROM complaints WHERE status = 'Pending'");
  const completed7d = await db.get("SELECT COUNT(*) as count FROM complaints WHERE status = 'Completed' AND completed_at > datetime('now', '-7 days')");
  
  // Shame counter: Days since last EMERGENCY completed
  const lastEmergency = await db.get("SELECT completed_at FROM complaints WHERE severity = 'EMERGENCY' AND status = 'Completed' ORDER BY completed_at DESC LIMIT 1");
  
  let daysSince = 0;
  if (lastEmergency && lastEmergency.completed_at) {
    const diffTime = Math.abs(new Date() - new Date(lastEmergency.completed_at));
    daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } else {
    // If no emergency ever completed, count since first emergency or just a high number/0
    const firstEmergency = await db.get("SELECT created_at FROM complaints WHERE severity = 'EMERGENCY' ORDER BY created_at ASC LIMIT 1");
    if (firstEmergency) {
      const diffTime = Math.abs(new Date() - new Date(firstEmergency.created_at));
      daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  const recent = await db.all(`
    SELECT c.*, (SELECT COUNT(*) FROM upvotes WHERE complaint_id = c.id) as upvotes 
    FROM complaints c 
    ORDER BY created_at DESC LIMIT 5
  `);

  res.json({
    activeIssues: activeCount.count,
    completedLastWeek: completed7d.count,
    shameDays: daysSince,
    recent: recent.map(c => ({
      ...c,
      room_number: (c.is_anonymous && req.user.role !== 'admin') ? 'ANON' : c.room_number
    }))
  });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
