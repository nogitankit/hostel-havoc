import { useState } from 'react';
import { Flame, LogIn } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    room_number: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? '/api/register' : '/api/login';
    
    try {
      const res = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (isRegister) {
        setIsRegister(false);
        alert('Registration successful! Please login.');
      } else {
        onLogin(data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-zinc-800 shadow-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20 mb-4">
            <Flame className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Hostel<span className="text-indigo-600">Havoc</span></h1>
          <p className="text-slate-500 dark:text-zinc-400 font-medium">
            {isRegister ? 'Create your account' : 'Welcome back, resident'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Username</label>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Password</label>
            <input 
              required
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Room Number</label>
              <input 
                required
                placeholder="e.g. 302-B"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                value={formData.room_number}
                onChange={(e) => setFormData({...formData, room_number: e.target.value})}
              />
            </div>
          )}

          <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4">
            {isRegister ? 'Register' : 'Sign In'}
            <LogIn size={20} />
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
