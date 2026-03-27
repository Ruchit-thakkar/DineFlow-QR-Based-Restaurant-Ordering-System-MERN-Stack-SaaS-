import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminItems from './pages/admin/AdminItems';
import AdminTables from './pages/admin/AdminTables';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import KitchenDashboard from './pages/admin/KitchenDashboard';
import AdminBillSettings from './pages/admin/AdminBillSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Client Pages
import ClientMenu from './pages/client/ClientMenu';
import ClientReview from './pages/client/ClientReview';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Client Routes */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Navigate to="/menu/preview" replace />} />
          <Route path="/menu/:tableId" element={<ClientMenu />} />
          <Route path="/reviews" element={<ClientReview />} />
        </Route>

        <Route path="/kitchen" element={<KitchenDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="items" element={<AdminItems />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="bill-settings" element={<AdminBillSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
