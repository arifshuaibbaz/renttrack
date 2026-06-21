import { useState } from 'react';
import { Clock, XCircle, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function PendingApproval() {
  const { status, logout, refreshStatus, user } = useAuth();
  const [checking, setChecking] = useState(false);

  const rejected = status === 'rejected';

  const handleRefresh = async () => {
    setChecking(true);
    await refreshStatus();
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center border border-slate-700">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${rejected ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
          {rejected
            ? <XCircle className="w-8 h-8 text-red-400" />
            : <Clock className="w-8 h-8 text-amber-400" />}
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {rejected ? 'Access Denied' : 'Awaiting Approval'}
        </h1>

        <p className="text-slate-400 text-sm mb-1">
          {rejected
            ? 'Your access request was rejected by the owner.'
            : 'Your account has been created and is waiting for the owner to approve access.'}
        </p>
        <p className="text-slate-500 text-xs mb-6">Signed in as {user?.email}</p>

        {!rejected && (
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition mb-3"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking…' : 'Check approval status'}
          </button>
        )}

        <button
          onClick={logout}
          className="w-full text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 py-2"
        >
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </div>
    </div>
  );
}
