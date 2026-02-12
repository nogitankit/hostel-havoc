import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

const __dirname = import.meta.dirname;
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`
});

export async function initDb() {
  const client = await pool.connect();
  try {
    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT,
        room_number TEXT,
        role TEXT DEFAULT 'student'
      )
    `);

    // Create Complaints table
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        room_number TEXT,
        category TEXT,
        title TEXT,
        description TEXT,
        severity TEXT,
        status TEXT DEFAULT 'Pending',
        is_anonymous BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create Upvotes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS upvotes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        complaint_id INTEGER,
        UNIQUE(user_id, complaint_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (complaint_id) REFERENCES complaints(id)
      )
    `);

    // Seed Admin and a test student if not exists
    const adminRes = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (adminRes.rowCount === 0) {
      const hashedAdminPw = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (username, password, room_number, role) VALUES ($1, $2, $3, $4)',
        ['admin', hashedAdminPw, 'ADMIN-OFFICE', 'admin']
      );

      const hashedStudentPw = await bcrypt.hash('student123', 10);
      await client.query(
        'INSERT INTO users (username, password, room_number, role) VALUES ($1, $2, $3, $4)',
        ['student1', hashedStudentPw, '302-B', 'student']
      );
      console.log('Database seeded with admin:admin123 and student1:student123');
    }
  } finally {
    client.release();
  }
  return pool;
}

export default pool;
