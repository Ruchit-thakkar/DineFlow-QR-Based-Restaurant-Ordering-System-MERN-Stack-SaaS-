import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { Check, Download, ShoppingBag } from 'lucide-react';
import { generateBill } from '../../utils/generateBill';
import socket from '../../socket';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  useEffect(() => {
    fetchOrders();

    socket.on('new_order', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      toast.success(`New order from ${newOrder.tableId?.name || 'Table'}!`, {
        icon: '🔔',
        duration: 5000,
      });
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    });

    socket.on('order_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.off('new_order');
      socket.off('order_updated');
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const token = Cookies.get('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirm = async (id) => {
    try {
      const token = Cookies.get('adminToken');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, { status: 'CONFIRMED' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order confirmed');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to confirm order');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-secondary">Live Orders</h2>
        <p className="text-slate-500 font-medium tracking-wide">Track and manage active restaurant orders in real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {orders.map(order => (
          <div key={order._id} className={`bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl ${order.status === 'PENDING' ? 'animate-new-order ring-2 ring-primary/20' : ''}`}>
            <div className={`p-6 border-b flex justify-between items-center ${
              order.status === 'PENDING' ? 'bg-slate-50' :
              order.status === 'MAKING' ? 'bg-blue-50/50' :
              order.status === 'READY' ? 'bg-accent/10' : 'bg-emerald-50/50'
            }`}>
              <div>
                <p className="font-bold text-secondary text-xl font-display">{order.tableId?.name || 'Unknown Table'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Order #{order._id.slice(-6)}</p>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                order.status === 'PENDING' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                order.status === 'MAKING' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                order.status === 'READY' ? 'bg-accent text-secondary border-accent-dark' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}>
                {order.status}
              </span>
            </div>
            
            <div className="p-6 flex-1 bg-white">
              <ul className="space-y-4 mb-6">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-xl bg-bg-cream text-primary flex items-center justify-center font-bold text-sm shadow-sm border border-primary/5">{item.quantity}</span>
                      <span className="text-secondary font-medium group-hover:text-primary transition-colors">{item.title}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-sm">₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Grand Total</span>
                <span className="text-2xl font-black text-primary">₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="p-6 bg-slate-50/30 mt-auto border-t border-slate-100">
              {order.status === 'READY' && (
                <button
                  onClick={() => handleConfirm(order._id)}
                  className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-200"
                >
                  <Check size={20} className="stroke-[3]" />
                  Complete Payment
                </button>
              )}
              {order.status === 'PENDING' && (
                <div className="flex items-center justify-center gap-3 text-slate-400 font-bold tracking-tight text-sm py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"></div>
                  Waiting for kitchen...
                </div>
              )}
              {order.status === 'MAKING' && (
                <div className="flex items-center justify-center gap-3 text-blue-500 font-bold tracking-tight text-sm py-2 animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  Chef is working...
                </div>
              )}
              {order.status === 'CONFIRMED' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => generateBill(order._id, 'pdf')}
                    className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-black text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-200"
                  >
                    <Download size={18} className="stroke-[3]" />
                    Invoice
                  </button>
                  <button
                    onClick={() => generateBill(order._id, 'image')}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-orange-600 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 shadow-xl shadow-orange-200"
                  >
                    Print
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-slate-100 border-dashed">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-slate-200" size={40} />
            </div>
            <p className="text-2xl font-bold text-secondary">No Live Orders</p>
            <p className="text-slate-400 mt-2 font-medium">New orders from customers will appear here instantly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
