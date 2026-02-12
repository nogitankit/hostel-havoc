// --- USER MANAGEMENT ENDPOINTS (Admin Only) ---

app.get('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const db = await dbPromise;
  const result = await db.query('SELECT id, username, room_number, role FROM users WHERE username != \'admin\'');
  res.json(result.rows);
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const db = await dbPromise;
  await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.json({ message: 'User removed' });
});
