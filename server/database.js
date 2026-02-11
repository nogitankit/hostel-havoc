import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

const dbPromise = open({
  filename: './hostel_havoc.db',
  driver: sqlite3.Database
});

export async function initDb() {
  const db = await dbPromise;

  // Create Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      room_number TEXT,
      role TEXT DEFAULT 'student'
    )
  `);

  // Create Complaints table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      room_number TEXT,
      category TEXT,
      title TEXT,
      description TEXT,
      severity TEXT,
      status TEXT DEFAULT 'Pending',
      is_anonymous INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create Upvotes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS upvotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      complaint_id INTEGER,
      UNIQUE(user_id, complaint_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (complaint_id) REFERENCES complaints(id)
    )
  `);

  // Seed Admin and a test student if not exists
  const adminExists = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const hashedAdminPw = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT INTO users (username, password, room_number, role) VALUES (?, ?, ?, ?)',
      ['admin', hashedAdminPw, 'ADMIN-OFFICE', 'admin']
    );

    const hashedStudentPw = await bcrypt.hash('student123', 10);
    await db.run(
      'INSERT INTO users (username, password, room_number, role) VALUES (?, ?, ?, ?)',
      ['student1', hashedStudentPw, '302-B', 'student']
    );
    console.log('Database seeded with admin:admin123 and student1:student123');
  }

  return db;
}

export default dbPromise;
