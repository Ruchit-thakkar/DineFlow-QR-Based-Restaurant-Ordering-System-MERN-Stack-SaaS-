import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, Image as ImageIcon } from 'lucide-react';

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', category: '' });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/items`);
      setItems(res.data);
    } catch (err) {
      toast.error('Failed to fetch items');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('adminToken');
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (imageFile) data.append('image', imageFile);

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/items/${editingId}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Item updated');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/items`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Item created');
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ title: '', description: '', price: '', category: '' });
      setImageFile(null);
      fetchItems();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = Cookies.get('adminToken');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item deleted');
      fetchItems();
    } catch (err) {
      console.error("Delete Item Error:", err);
      toast.error('Failed to delete item');
    }
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setFormData({ title: item.title, description: item.description, price: item.price, category: item.category });
    setImageFile(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Menu Items</h2>
        <button
          onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); setFormData({ title: '', description: '', price: '', category: '' }); }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> {isFormOpen ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Item' : 'New Menu Item'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input type="text" required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input type="text" required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" placeholder="e.g. Starters" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
              <input type="number" required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image (Optional)</label>
              <input type="file" accept="image/*" className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700" onChange={e => setImageFile(e.target.files[0])} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-xl transition-colors">
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {items.map(item => (
            <li key={item._id} className="p-4 flex sm:flex-row flex-col gap-4 sm:items-center hover:bg-slate-50 transition-colors">
              <div className="w-16 h-16 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-400" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">{item.title}</h4>
                <p className="text-sm text-slate-500 mb-1">{item.description}</p>
                <div className="flex gap-2 text-xs font-semibold">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{item.category}</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">₹{item.price}</span>
                </div>
              </div>
              <div className="flex gap-2 sm:self-center self-end">
                <button onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
              </div>
            </li>
          ))}
          {items.length === 0 && <li className="p-8 text-center text-slate-500">No items available. Create one to get started.</li>}
        </ul>
      </div>
    </div>
  );
}
