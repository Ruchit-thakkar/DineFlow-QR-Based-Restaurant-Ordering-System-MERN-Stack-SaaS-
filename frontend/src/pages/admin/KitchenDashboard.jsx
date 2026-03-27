import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { ChefHat, CheckSquare } from 'lucide-react';
import socket from '../../socket';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  useEffect(() => {
    fetchOrders();

    socket.on('new_order', (newOrder) => {
      // Only add if not CONFIRMED (new orders are PENDING)
      if (newOrder.status !== 'CONFIRMED') {
        setOrders(prev => [newOrder, ...prev]);
        toast.success(`New order from ${newOrder.tableId?.name || 'Table'}!`, {
          icon: '👨‍🍳',
          duration: 5000,
        });
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    });

    socket.on('order_updated', (updatedOrder) => {
      setOrders(prev => {
        if (updatedOrder.status === 'CONFIRMED') {
          return prev.filter(o => o._id !== updatedOrder._id);
        }
        return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
      });
    });

    return () => {
      socket.off('new_order');
      socket.off('order_updated');
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const token = Cookies.get('adminToken');
      const res = await axios.get(`${(import.meta.env.VITE_API_URL || "")}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter last 24 hours orders & exclude CONFIRMED
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const filtered = res.data.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= yesterday && order.status !== 'CONFIRMED';
      });
      setOrders(filtered);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = Cookies.get('adminToken');
      await axios.put(`${(import.meta.env.VITE_API_URL || "")}/api/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream p-6 sm:p-10 space-y-10">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-extrabold text-secondary flex items-center gap-4">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
              <ChefHat size={32} className="text-white" />
            </div> 
            Kitchen Display
          </h2>
          <p className="text-slate-500 font-semibold tracking-wide ml-1">Live orders awaiting preparation</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-bold text-secondary uppercase tracking-widest text-xs">Live System Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {orders.map(order => (
          <div key={order._id} className={`bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-500 hover:scale-[1.02] ${order.status === 'PENDING' ? 'animate-new-order ring-4 ring-primary/10' : ''}`}>
            <div className={`p-8 border-b flex justify-between items-center ${
              order.status === 'PENDING' ? 'bg-primary/5' :
              order.status === 'MAKING' ? 'bg-blue-50/50' : 'bg-slate-50/50'
            }`}>
              <div>
                <p className="font-black text-secondary text-3xl mb-1">{order.tableId?.name || 'Table'}</p>
                <p className="text-xs text-slate-400 font-mono font-bold tracking-[0.2em] uppercase">Order ID: {order._id.slice(-6)}</p>
              </div>
              <span className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border-2 ${
                order.status === 'PENDING' ? 'bg-primary text-white border-primary/20 shadow-lg shadow-primary/30' :
                order.status === 'MAKING' ? 'bg-blue-600 text-white border-blue-200 shadow-lg shadow-blue-200' : 
                'bg-slate-100 text-slate-400 border-slate-200'
              }`}>
                {order.status}
              </span>
            </div>
            
            <div className="p-8 flex-1">
              <ul className="space-y-6">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start group">
                    <div className="flex items-start gap-5">
                      <span className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center font-black text-xl shadow-lg">{item.quantity}</span>
                      <div className="pt-1">
                        <span className="text-2xl font-bold text-secondary group-hover:text-primary transition-colors block">{item.title}</span>
                        <span className="text-slate-400 text-sm font-medium mt-1 inline-block">Standard Preparation</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-8 bg-slate-50/50 border-t border-slate-100">
              {order.status === 'PENDING' && (
                <button
                  onClick={() => updateStatus(order._id, 'MAKING')}
                  className="w-full flex items-center justify-center gap-4 bg-primary hover:bg-orange-600 text-white font-black text-xl py-6 rounded-[1.5rem] transition-all duration-300 shadow-2xl shadow-primary/30 active:scale-95"
                >
                  <ChefHat size={28} className="stroke-[2.5]" />
                  START COOKING
                </button>
              )}
              
              {order.status === 'MAKING' && (
                <button
                  onClick={() => updateStatus(order._id, 'READY')}
                  className="w-full flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-6 rounded-[1.5rem] transition-all duration-300 shadow-2xl shadow-blue-300 active:scale-95"
                >
                  <CheckSquare size={28} className="stroke-[2.5]" />
                  MARK AS READY
                </button>
              )}
              
              {order.status === 'READY' && (
                <div className="bg-emerald-50 text-emerald-600 text-center py-6 rounded-[1.5rem] font-black text-xl border-2 border-emerald-100 flex items-center justify-center gap-3 animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  ORDER DISPATCHED
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {orders.length === 0 && (
        <div className="py-40 text-center bg-white rounded-[4rem] border-3 border-slate-100 border-dashed max-w-4xl mx-auto shadow-inner">
          <div className="bg-slate-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8">
            <ChefHat className="text-slate-200" size={56} />
          </div>
          <p className="text-4xl font-black text-secondary">Kitchen is Clear!</p>
          <p className="text-slate-400 mt-4 text-xl font-medium">All orders have been prepared. Enjoy the break!</p>
        </div>
      )}
    </div>
  );
}
