import { useState } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ClientReview() {
  const [formData, setFormData] = useState({ name: '', rating: 5, comment: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.rating === 0) {
        toast.error('Please select a rating');
        return;
      }
      await axios.post(`${import.meta.env.VITE_API_URL}/api/reviews`, formData);
      toast.success('Thank you for your feedback!');
      navigate(-1);
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 min-h-screen flex flex-col justify-center">
      <div className="bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100">
        <h2 className="text-3xl font-extrabold text-slate-800 mb-6 text-center">Rate your experience</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({...formData, rating: star})}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star size={36} fill={star <= formData.rating ? '#F59E0B' : 'transparent'} className={star <= formData.rating ? 'text-amber-500' : 'text-slate-300'} />
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Name (Optional)</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Comment (Optional)</label>
            <textarea className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" rows="4" placeholder="Tell us what you loved..." value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})}></textarea>
          </div>
          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg">
            Submit Review
          </button>
          
          <div className="mt-4 text-center">
            <button type="button" onClick={() => navigate(-1)} className="text-slate-500 text-sm hover:text-slate-700 underline underline-offset-4">
              Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
