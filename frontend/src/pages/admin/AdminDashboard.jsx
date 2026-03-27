import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ShoppingBag, Clock, CheckCircle, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, confirmedOrders: 0, totalRevenue: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = Cookies.get('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = [
    { label: "Today's Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-primary" },
    { label: "Pending", value: stats.pendingOrders, icon: Clock, color: "bg-amber-500" },
    { label: "Ready", value: stats.confirmedOrders, icon: CheckCircle, color: "bg-emerald-500" },
    { label: "Today's Revenue", value: `₹${stats.totalRevenue}`, icon: IndianRupee, color: "bg-secondary" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-secondary">Dashboard Overview</h2>
        <p className="text-slate-500 font-medium">Welcome back, Manager! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg ${stat.color} shadow-${stat.color.split('-')[1]}/20`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 tracking-wide uppercase">{stat.label}</p>
              <h3 className="text-3xl font-bold text-secondary mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action or Info Section */}
      <div className="bg-secondary rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-3xl font-bold">DineFlow Analytics</h3>
            <p className="text-slate-400 max-w-md text-lg">Check out the full analytics report to see peak hours and best selling items.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/admin/analytics'}
            className="bg-primary hover:bg-white hover:text-secondary text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-primary/20"
          >
            Go to Analytics
          </button>
        </div>
        {/* Abstract shapes for premium feel */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl -ml-20 -mb-20"></div>
      </div>
    </div>
  );
}
