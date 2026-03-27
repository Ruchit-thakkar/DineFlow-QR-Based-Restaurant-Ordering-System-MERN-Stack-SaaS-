import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Trash2, Plus } from 'lucide-react';

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [name, setName] = useState('');
  const qrRefs = useRef({});

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const token = Cookies.get('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTables(res.data);
    } catch (err) {
      toast.error('Failed to fetch tables');
    }
  };

  const createTable = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('adminToken');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/tables`, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Table created');
      setName('');
      fetchTables();
    } catch (err) {
      toast.error('Failed to create table');
    }
  };

  const deleteTable = async (id) => {
    try {
      const token = Cookies.get('adminToken');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/tables/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Table deleted');
      fetchTables();
    } catch (err) {
      console.error("Delete Table Error:", err);
      toast.error('Failed to delete table');
    }
  };

  const downloadQR = async (id, tableName, format) => {
    const node = qrRefs.current[id];
    if (!node) return;
    try {
      // Using a different approach since html2canvas is failing
      const dataUrl = await new Promise(resolve => {
         const canvas = node.querySelector('canvas');
         if (canvas) resolve(canvas.toDataURL('image/png'));
         else resolve(null);
      });
      if (!dataUrl) throw new Error('Canvas not found');
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${tableName}-QR.png`;
        link.href = dataUrl;
        link.click();
      } else if (format === 'pdf') {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        pdf.setFontSize(20);
        pdf.text(`Scan to order at ${tableName}`, 105, 20, null, null, 'center');
        pdf.addImage(dataUrl, 'PNG', 55, 30, 100, 100);
        pdf.save(`${tableName}-QR.pdf`);
      }
    } catch (err) {
      toast.error('Failed to download QR');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Table & QR Management</h2>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={createTable} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">New Table Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Table 5"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 transition-colors h-[50px]">
            <Plus size={20} /> Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(table => {
          const qrUrl = `${window.location.origin}/menu/${table.identifier}`;
          return (
            <div key={table._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-4">{table.name}</h3>
              <div 
                ref={el => qrRefs.current[table._id] = el}
                className="bg-white p-4 rounded-xl border-2 border-slate-100 mb-6 inline-block"
              >
                <QRCodeCanvas value={qrUrl} size={150} level="H" includeMargin={true} />
              </div>
              
              <div className="flex gap-2 w-full mb-4">
                <button
                  onClick={() => downloadQR(table._id, table.name, 'png')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <Download size={16} /> PNG
                </button>
                <button
                  onClick={() => downloadQR(table._id, table.name, 'pdf')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <Download size={16} /> PDF
                </button>
              </div>
              <button
                onClick={() => deleteTable(table._id)}
                className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors mt-auto"
              >
                <Trash2 size={16} /> Delete Table
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
