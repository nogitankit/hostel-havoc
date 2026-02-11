import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, Clock, User, CheckCircle2 } from 'lucide-react';

const ComplaintDetail = ({ user, token }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // For simplicity, we filter from the main list, but a dedicated GET /api/complaints/:id would be better
      const res = await fetch('http://localhost:3001/api/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const item = data.find(c => c.id === parseInt(id));
      setComplaint(item);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, token]);

  const handleUpdateStatus = async (newStatus) => {
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

  const handleUpvote = async () => {
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

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!complaint) return <div className="p-8 text-center">Complaint not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium group transition-colors">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
        <div className="p-8 md:p-10 space-y-8">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  complaint.severity === 'EMERGENCY' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {complaint.severity}
                </span>
                <span className="text-sm font-bold text-slate-400">{complaint.category}</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight leading-tight">{complaint.title}</h1>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 font-bold border border-indigo-100">
                <Clock size={18} /> {complaint.status}
              </div>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                {new Date(complaint.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 leading-relaxed italic">
            "{complaint.description}"
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Reported By</p>
                <p className="text-sm font-bold">Room {complaint.room_number}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <ThumbsUp size={20} /> <span className="text-xl">{complaint.upvotes}</span>
              </div>
              
              <button 
                onClick={handleUpvote}
                disabled={complaint.has_upvoted}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  complaint.has_upvoted ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white'
                }`}
              >
                {complaint.has_upvoted ? 'Upvoted' : 'Me Too'}
              </button>
            </div>
          </div>

          {user.role === 'admin' && complaint.status === 'Pending' && (
            <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
              <button 
                onClick={() => handleUpdateStatus('Completed')}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 size={20} /> Mark as Completed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
