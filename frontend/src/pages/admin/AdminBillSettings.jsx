import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { Save, ReceiptText } from 'lucide-react';

export default function AdminBillSettings() {
  const [settings, setSettings] = useState({
    restaurantName: '',
    address: '',
    gstNumber: '',
    gstPercentage: 0,
    showGst: false,
    serviceCharge: 0,
    currency: 'INR',
    showBreakdown: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = Cookies.get('adminToken');
      const res = await axios.get(`${(import.meta.env.VITE_API_URL || "")}/api/bill-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) setSettings(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bill settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('adminToken');
      await axios.put(`${(import.meta.env.VITE_API_URL || "")}/api/bill-settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Bill settings saved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ReceiptText className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-800">Bill & Invoice Settings</h2>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Restaurant Name</label>
              <input
                type="text"
                value={settings.restaurantName}
                onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Address (Printed on Bill)</label>
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Currency (Symbol or Code)</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. INR or ₹"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Service Charge (Fixed amount)</label>
              <input
                type="number"
                value={settings.serviceCharge}
                onChange={(e) => setSettings({ ...settings, serviceCharge: Number(e.target.value) })}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                min="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">Tax & GST Settings</h3>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-4">
                <div>
                  <p className="font-medium text-slate-800">Enable GST Configuration</p>
                  <p className="text-sm text-slate-500">Calculate and show GST on invoices</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showGst}
                    onChange={(e) => setSettings({ ...settings, showGst: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {settings.showGst && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">GST Number</label>
                  <input
                    type="text"
                    value={settings.gstNumber}
                    onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter GSTIN"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">GST Percentage (%)</label>
                  <input
                    type="number"
                    value={settings.gstPercentage}
                    onChange={(e) => setSettings({ ...settings, gstPercentage: Number(e.target.value) })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="showBreakdown"
                    checked={settings.showBreakdown}
                    onChange={(e) => setSettings({ ...settings, showBreakdown: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="showBreakdown" className="text-sm text-slate-700">
                    Show Tax Breakdown (CGST / SGST halves) in Bill Summary
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              <Save size={18} />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
