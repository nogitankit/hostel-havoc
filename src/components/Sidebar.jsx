import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  ListTodo, 
  Menu, 
  X,
  AlertTriangle,
  Flame,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'File Complaint', path: '/file-complaint', icon: MessageSquarePlus },
    { name: 'Status Check', path: '/status', icon: ListTodo },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg focus:outline-none"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out
        bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8">
            <div className="flex items-center gap-1">
              <div className="bg-indigo-600/0 p-2 rounded-lg shadow-lg shadow-indigo-500/0">
                <img  src='/logo.png' />
              </div>
              <span className="text-xl font-bold tracking-tight">Hostel<span className="text-indigo-600">Havoc</span></span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium' 
                    : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400'}
                `}
              >
                <item.icon size={20} className="transition-transform group-hover:scale-110" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Alert (Static for demo) */}
          <div className="p-4 m-4 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/20 hidden md:block">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0" size={18} />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">System Alert</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Maintenance at 10 PM.</p>
              </div>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                <UserIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{user?.username}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{user?.role} • {user?.room_number}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-bold text-sm"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
