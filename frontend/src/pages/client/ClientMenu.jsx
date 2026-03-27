import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Search, Plus, Minus, X, Download, Star, Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateBill } from '../../utils/generateBill';

export default function ClientMenu() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [orderComplete, setOrderComplete] = useState(null);
  const billRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/items`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/items/categories`)
      ]);
      setItems(itemsRes.data);
      setCategories(['All', ...catsRes.data]);
    } catch (err) {
      toast.error('Failed to load menu');
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.itemId === item._id);
    if (existing) {
      setCart(cart.map(c => c.itemId === item._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { itemId: item._id, title: item.title, price: item.price, quantity: 1 }]);
    }
    toast.success('Added to cart', {
      position: 'bottom-center',
      duration: 1500,
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(c => {
      if (c.itemId === id) {
        return { ...c, quantity: c.quantity + delta };
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const placeOrder = async () => {
    if (cart.length === 0) return;
    try {
      const dbTable = await axios.get(`${import.meta.env.VITE_API_URL}/api/tables`).then(res => res.data.find(t => t.identifier === tableId));
      if (!dbTable) {
        toast.error('Invalid Table QR Code!. Please scan proper QR again.');
        return;
      }
      
      const payload = {
        tableId: dbTable._id,
        items: cart,
        totalAmount: totalCartAmount
      };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, payload);
      
      const billRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${res.data._id}/bill`);
      
      setOrderComplete({ ...billRes.data.order, billDetails: billRes.data.billDetails, tableName: dbTable.name });
      setCart([]);
      setIsCartOpen(false);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error('Failed to place order');
    }
  };

  const downloadBill = async () => {
    await generateBill(orderComplete._id, 'pdf');
  };

  return (
    <div className="bg-bg-cream min-h-screen pb-32 font-sans select-none">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl px-6 py-6 sticky top-0 z-40 border-b border-primary/10 rounded-b-[2rem] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-secondary tracking-tight">DineFlow</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] -mt-1">Premium Dining</p>
          </div>
          <button 
            onClick={() => navigate('/reviews')} 
            className="flex items-center gap-2 text-xs font-black text-secondary bg-accent hover:bg-accent-dark px-4 py-2.5 rounded-2xl transition-all active:scale-95 shadow-lg shadow-accent/20"
          >
            <Star size={16} fill="currentColor" strokeWidth={0} /> 
            <span>4.8 • REVIEWS</span>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search your favorites..." 
            className="w-full pl-14 pr-6 py-4 bg-bg-cream border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-[1.5rem] outline-none transition-all font-medium text-secondary shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 py-8 max-w-5xl mx-auto space-y-10">
        {/* Horizontal Scroll Categories */}
        <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar -mx-6 px-6 sticky top-40 bg-bg-cream/50 backdrop-blur-sm z-30 py-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 transform ${
                activeCategory === cat 
                  ? 'bg-secondary text-white shadow-xl shadow-secondary/20 -translate-y-1' 
                  : 'bg-white text-slate-400 hover:text-secondary hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 italic text-slate-400 font-medium">
            "Searching for something special? Not found yet!"
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
              <div key={item._id} className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-50 flex flex-col gap-5 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[5/4] w-full bg-slate-50 rounded-[2rem] overflow-hidden relative shadow-inner">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200 font-black tracking-widest text-xs">NO VISUAL</div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-xl text-[10px] font-black text-secondary shadow-lg uppercase tracking-widest border border-slate-100">
                    {item.category}
                  </div>
                </div>
                
                <div className="px-3 pb-3 flex-1 flex flex-col">
                  <h3 className="font-extrabold text-xl text-secondary mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-slate-400 font-medium line-clamp-2 mb-6 flex-1 leading-relaxed">{item.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Price</span>
                      <span className="font-black text-2xl text-secondary">₹{item.price}</span>
                    </div>
                    <button 
                      onClick={() => addToCart(item)}
                      className="bg-secondary hover:bg-primary text-white w-14 h-14 rounded-2xl transition-all duration-300 active:scale-90 shadow-xl shadow-secondary/10 flex items-center justify-center group/btn"
                    >
                      <Plus size={24} strokeWidth={3} className="group-hover/btn:rotate-90 transition-transform duration-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {totalCartItems > 0 && !isCartOpen && !orderComplete && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-10 left-6 right-6 sm:left-auto sm:right-10 sm:w-80 bg-secondary text-white p-5 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center justify-between hover:bg-black transition-all active:scale-95 z-40 transform hover:-translate-y-2 animate-bounce-subtle"
        >
          <div className="flex items-center gap-4">
            <div className="relative bg-primary p-3 rounded-2xl shadow-lg">
              <ShoppingCart size={24} className="text-white" />
              <span className="absolute -top-2 -right-2 bg-accent text-secondary text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-secondary shadow-md">
                {totalCartItems}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Items in basket</p>
              <p className="font-black text-lg">View Cart</p>
            </div>
          </div>
          <p className="text-2xl font-black text-white">₹{totalCartAmount}</p>
        </button>
      )}

      {/* Modern Cart Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-secondary/60 backdrop-blur-md transition-opacity">
          <div className="bg-bg-cream w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-right rounded-l-[3rem] sm:rounded-l-[4rem] overflow-hidden border-l-4 border-primary/20">
            <div className="p-10 flex justify-between items-center bg-white border-b border-primary/5">
              <h2 className="text-3xl font-black text-secondary flex items-center gap-4">
                <div className="bg-slate-100 p-3 rounded-2xl">
                  <ShoppingCart size={28} className="text-primary" />
                </div>
                Your Plate
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all active:scale-90">
                <X size={24} strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              {cart.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <ShoppingCart size={32} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold italic">Your basket is resting...</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.itemId} className="flex justify-between items-center group bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 transition-all hover:shadow-lg">
                    <div className="flex-1">
                      <h4 className="font-extrabold text-secondary group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-primary font-black text-sm mt-1">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-bg-cream p-2 rounded-2xl shadow-inner">
                      <button onClick={() => updateQuantity(item.itemId, -1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-md text-secondary hover:text-red-500 active:scale-90 transition-all"><Minus size={18} strokeWidth={3}/></button>
                      <span className="font-black text-lg w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.itemId, 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-md text-secondary hover:text-primary active:scale-90 transition-all"><Plus size={18} strokeWidth={3}/></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-10 border-t border-primary/5 bg-white space-y-8 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center">
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs leading-none">Total Investment</p>
                  <p className="text-4xl font-black text-secondary">₹{totalCartAmount}</p>
                </div>
                <button 
                  onClick={placeOrder}
                  className="w-full bg-secondary hover:bg-primary text-white font-black text-xl py-6 rounded-[2rem] shadow-2xl shadow-secondary/20 transition-all active:scale-95 group flex items-center justify-center gap-4"
                >
                  Confirm Items
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Premium Bill Modal */}
      {orderComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-xl p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border-t-8 border-primary">
            <div className="flex-1 overflow-y-auto p-12 relative" ref={billRef} style={{backgroundColor: '#fff'}}>
              <div className="text-center mb-10">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50/50 scale-110">
                  <Check size={48} strokeWidth={4} />
                </div>
                <h2 className="text-4xl font-black text-secondary tracking-tighter">Order Success!</h2>
                <p className="text-slate-400 font-bold text-sm mt-3 uppercase tracking-widest">Receipt Generated</p>
              </div>
              
              <div className="bg-bg-cream rounded-[2rem] p-8 mb-8 space-y-4 border border-primary/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-black uppercase tracking-widest">Order Reference</span>
                  <span className="font-mono font-black text-secondary bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">#{orderComplete._id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-black uppercase tracking-widest">Table Name</span>
                  <span className="font-black text-secondary">{orderComplete.tableName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-black uppercase tracking-widest">Timestamp</span>
                  <span className="font-bold text-slate-500">{new Date(orderComplete.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="space-y-6 mb-10 px-2">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">ITEMIZED LIST</p>
                {orderComplete.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div className="flex flex-col">
                      <span className="text-secondary font-extrabold text-lg">{item.title}</span>
                      <span className="text-xs font-bold text-slate-300 uppercase italic">Qty: {item.quantity}</span>
                    </div>
                    <span className="text-secondary font-black text-lg">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Net Total</span>
                  <span className="text-slate-600 font-black">₹{orderComplete.billDetails.subtotal.toFixed(2)}</span>
                </div>
                {orderComplete.billDetails.serviceCharge > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Service (5%)</span>
                    <span className="text-slate-600 font-black">₹{orderComplete.billDetails.serviceCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Taxation (GST)</span>
                  <span className="text-slate-600 font-black">₹{orderComplete.billDetails.gstAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8 mt-4 border-t-4 border-secondary border-dashed">
                <span className="font-black text-secondary uppercase tracking-[0.3em] text-sm">Amount Paid</span>
                <span className="text-4xl font-black text-primary tracking-tighter">₹{orderComplete.billDetails.grandTotal.toFixed(2)}</span>
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-[10px] font-black italic text-slate-300 uppercase tracking-widest">Thank you for dining at DineFlow</p>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-6">
              <button 
                onClick={downloadBill}
                className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-[1.5rem] transition-all active:scale-95 shadow-xl shadow-emerald-200"
              >
                <Download size={20} strokeWidth={3} /> DOCUMENT
              </button>
              <button 
                onClick={() => setOrderComplete(null)}
                className="flex items-center justify-center bg-secondary hover:bg-black text-white font-black py-5 rounded-[1.5rem] transition-all active:scale-95 shadow-xl shadow-secondary/10"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 3s infinite; }
      `}</style>
    </div>
  );
}
