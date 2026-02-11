import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, ThumbsUp, MessageSquare, CheckCircle2 } from 'lucide-react';

const StatusCheck = ({ user, token }) => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setComplaints(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:3001/api/complaints/${id}/upvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, newStatus, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:3001/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = complaints.filter(c => activeFilter === 'All' || c.category === activeFilter);
  const categories = ['All', 'Wi-Fi', 'Electrical', 'Plumbing', 'Food', 'Furniture', 'Other'];

  if (loading) return <div className="p-8 text-center animate-pulse">Loading complaints...</div>;

  return (
    <div className="space-y-8 w-full max-w-full">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Status Check</h1>
        
        {/* Filter Bar */}
        <div className="w-full overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {categories.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeFilter === f 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Complaint List */}
      <div className="grid grid-cols-1 gap-4 w-full">
        {filtered.map((item) => (
          <div 
            key={item.id}
            onClick={() => navigate(`/complaint/${item.id}`)}
            className="group relative p-5 md:p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden shadow-sm"
          >
            {/* Severity Strip */}
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
              item.severity === 'EMERGENCY' ? 'bg-red-500' : 
              item.severity === 'Annoying' ? 'bg-amber-500' : 'bg-blue-500'
            }`} />

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 shrink-0">
                    Room {item.room_number}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                    item.status === 'Completed' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                    : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 leading-tight group-hover:text-indigo-600 transition-colors break-words">
                  {item.title}
                </h3>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-zinc-500">
                  <span className="flex items-center gap-1 shrink-0"><ThumbsUp size={14} /> {item.upvotes} Me Too's</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-0">
                {user.role === 'admin' && item.status === 'Pending' && (
                  <button 
                    onClick={(e) => handleUpdateStatus(item.id, 'Completed', e)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold whitespace-nowrap shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 size={16} /> Mark Completed
                  </button>
                )}
                
                <button 
                  onClick={(e) => handleUpvote(item.id, e)} 
                  disabled={item.has_upvoted}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                    item.has_upvoted 
                    ? 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  <ThumbsUp size={16} /> {item.has_upvoted ? 'Upvoted' : 'Me Too'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-zinc-800">
            <p className="text-slate-500 font-medium">No complaints found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusCheck;
