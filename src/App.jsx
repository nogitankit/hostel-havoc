import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FileComplaint from './pages/FileComplaint';
import StatusCheck from './pages/StatusCheck';
import ComplaintDetail from './pages/ComplaintDetail';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const handleLogin = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="lg:pl-64 min-h-screen w-full">
          <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 w-full">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard user={user} token={token} />} />
              <Route path="/file-complaint" element={<FileComplaint user={user} token={token} />} />
              <Route path="/status" element={<StatusCheck user={user} token={token} />} />
              <Route path="/complaint/:id" element={<ComplaintDetail user={user} token={token} />} />
              <Route path="/admin" element={<AdminPanel user={user} token={token} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
