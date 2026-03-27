import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { LayoutDashboard, UtensilsCrossed, QrCode, ClipboardList, Star, Settings, LogOut, ReceiptText, TrendingUp } from 'lucide-react';

const AdminLayout = () => {
  const token = Cookies.get('adminToken');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    Cookies.remove('adminToken');
    window.location.href = '/admin/login';
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/admin/orders', icon: ClipboardList, label: 'Orders' },
    { path: '/admin/items', icon: UtensilsCrossed, label: 'Menu Items' },
    { path: '/admin/tables', icon: QrCode, label: 'Tables / QR' },
    { path: '/admin/reviews', icon: Star, label: 'Reviews' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
    { path: '/admin/bill-settings', icon: ReceiptText, label: 'Bill Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 sm:flex">
      {/* Sidebar */}
      <aside className="sm:w-64 bg-secondary text-white hidden sm:flex sm:flex-col sticky top-0 h-screen shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl">
            <UtensilsCrossed className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">DineFlow</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover-scale ${
                location.pathname === item.path
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-white' : 'text-slate-400'}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 active-pop"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full bg-bg-cream/50">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-secondary text-white border-t border-white/5 flex justify-around p-3 z-50 overflow-x-auto pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.3)] rounded-t-3xl">
        {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 min-w-[64px] transition-colors ${
                location.pathname === item.path ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
      </nav>
    </div>
  );
};
export default AdminLayout;
