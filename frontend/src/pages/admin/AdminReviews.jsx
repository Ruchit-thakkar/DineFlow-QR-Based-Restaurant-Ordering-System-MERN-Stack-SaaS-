import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { Trash2, Star } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = Cookies.get('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (err) {
      toast.error('Failed to fetch reviews');
    }
  };

  const deleteReview = async (id) => {
    try {
      const token = Cookies.get('adminToken');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) {
      console.error("Delete Review Error:", err);
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Customer Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map(review => (
          <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-slate-800">{review.name || 'Anonymous'}</h4>
                <div className="flex text-amber-500 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} className="text-amber-400" />
                  ))}
                </div>
              </div>
              <button onClick={() => deleteReview(review._id)} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-slate-600 italic text-sm flex-1">"{review.comment || 'No comment provided.'}"</p>
            <span className="text-xs text-slate-400 mt-4 block text-right">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
            No reviews yet.
          </div>
        )}
      </div>
    </div>
  );
}
