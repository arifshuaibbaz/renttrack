import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import RentTracker from './pages/RentTracker';
import Reports from './pages/Reports';
import { useData } from './hooks/useData';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const data = useData();

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard properties={data.properties} payments={data.payments} />;
      case 'properties':
        return <Properties
          properties={data.properties}
          addProperty={data.addProperty}
          updateProperty={data.updateProperty}
          deleteProperty={data.deleteProperty}
        />;
      case 'rents':
        return <RentTracker
          properties={data.properties}
          payments={data.payments}
          recordPayment={data.recordPayment}
          deletePayment={data.deletePayment}
          getPaymentForProperty={data.getPaymentForProperty}
        />;
      case 'reports':
        return <Reports properties={data.properties} payments={data.payments} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar active={page} onNavigate={setPage} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
