import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = Cookies.get('adminToken');
      const res = await axios.get(`${(import.meta.env.VITE_API_URL || "")}/api/orders/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading insights...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load analytics.</div>;

  const COLORS = ['#FF6B35', '#FFC857', '#1E1E1E', '#2ECC71', '#E74C3C'];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-secondary">Analytics Dashboard</h2>
        <p className="text-slate-500 font-medium">Data-driven insights for DineFlow</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Revenue" value={`₹${data.todayRevenue}`} icon={DollarSign} color="primary" />
        <StatCard title="Total Confirmed" value={data.totalOrders} icon={ShoppingBag} color="secondary" />
        <StatCard title="Best Seller" value={data.bestSellers[0]?.name || 'N/A'} icon={TrendingUp} color="accent" />
        <StatCard title="Active Tables" value={data.tablePerformance.length} icon={Users} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Peak Hours Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 text-secondary">Peak Busy Hours</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.peakHours}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="orders" stroke="#FF6B35" fillOpacity={1} fill="url(#colorOrders)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 text-secondary">Top 5 Best Sellers</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bestSellers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fill: '#1E1E1E', fontWeight: 500, fontSize: 12}} />
                <Tooltip cursor={{fill: '#fff8f2'}} />
                <Bar dataKey="qty" fill="#FFC857" radius={[0, 10, 10, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Performance Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-xl font-bold mb-6 text-secondary">Table Performance (Revenue)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.tablePerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#1E1E1E', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#fff8f2'}} />
                <Bar dataKey="revenue" fill="#1E1E1E" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    primary: 'bg-orange-50 text-primary',
    secondary: 'bg-slate-900 text-white',
    accent: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-105 duration-300">
      <div className={`p-4 rounded-2xl ${colorMap[color] || 'bg-slate-50'}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
