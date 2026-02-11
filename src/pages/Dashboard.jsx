import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, Zap, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setStats(data);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <div className="animate-pulse space-y-8">...</div>;

  const statCards = [
    { label: 'Active Issues', value: stats.activeIssues, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Completed (7d)', value: stats.completedLastWeek, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-1">Welcome back, {user.username}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 p-6 rounded-3xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white flex flex-col justify-between relative overflow-hidden group">
          <Zap className="absolute -top-6 -right-6 w-32 h-32 text-indigo-500/10 group-hover:scale-110 transition-transform duration-500" />
          <div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Public Shame Counter</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-6xl font-black">{String(stats.shameDays).padStart(2, '0')}</span>
              <span className="text-xl font-medium opacity-60">days</span>
            </div>
            <p className="mt-2 text-sm opacity-80 leading-relaxed">Since the last EMERGENCY was resolved.</p>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {statCards.map((stat) => (
            <div key={stat.label} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between">
              <div className={`${stat.bg} w-12 h-12 rounded-2xl flex items-center justify-center`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div className="mt-8">
                <span className="text-3xl font-bold tracking-tight block">{stat.value}</span>
                <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare size={20} className="text-indigo-600" />
            Recent Activity
          </h2>
          <button onClick={() => navigate('/status')} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.recent.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate(`/complaint/${item.id}`)}
              className="group p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-300 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                    {item.room_number}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider
                    ${item.severity === 'EMERGENCY' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}
                  `}>
                    {item.severity}
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
