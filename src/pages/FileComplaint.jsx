import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Info } from 'lucide-react';

const FileComplaint = ({ user, token }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: 'Wi-Fi',
    title: '',
    description: '',
    severity: 'Annoying',
    is_anonymous: false
  });

  const categories = ['Wi-Fi', 'Plumbing', 'Electrical', 'Furniture', 'Mess/Food', 'Other'];
  const severities = [
    { label: 'Chill', value: 'Chill', color: 'bg-blue-500', desc: 'Can wait a day or two' },
    { label: 'Annoying', value: 'Annoying', color: 'bg-amber-500', desc: 'Fix it soon please' },
    { label: 'EMERGENCY', value: 'EMERGENCY', color: 'bg-red-500', desc: 'Critical infrastructure failure' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        navigate('/status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">File a Complaint</h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-1">Room {user.room_number}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
           <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-800 cursor-pointer hover:border-indigo-400 transition-all">
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-indigo-600 rounded-lg"
                checked={formData.is_anonymous}
                onChange={(e) => setFormData({...formData, is_anonymous: e.target.checked})}
              />
              <div>
                <span className="text-sm font-bold block">Anonymous Mode</span>
                <span className="text-[10px] text-slate-500 italic">Hide room number from public feed (Admins still see it)</span>
              </div>
            </label>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-500">Subject</label>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-500">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    formData.category === cat 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-500">Details</label>
            <textarea 
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {severities.map((sev) => (
            <button
              key={sev.value}
              type="button"
              onClick={() => setFormData({...formData, severity: sev.value})}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                formData.severity === sev.value 
                ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-500/5' 
                : 'border-slate-200 dark:border-zinc-800'
              }`}
            >
              <span className="font-bold text-sm block">{sev.label}</span>
              <span className="text-[10px] text-slate-500">{sev.desc}</span>
            </button>
          ))}
        </div>

        <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
          Submit Complaint <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default FileComplaint;
