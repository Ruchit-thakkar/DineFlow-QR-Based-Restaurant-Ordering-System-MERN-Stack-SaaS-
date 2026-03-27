import { Outlet } from 'react-router-dom';

const ClientLayout = () => {
  return (
    <div className="min-h-screen bg-bg-cream font-sans sm:pb-0 pb-16">
      <Outlet />
    </div>
  );
};
export default ClientLayout;
