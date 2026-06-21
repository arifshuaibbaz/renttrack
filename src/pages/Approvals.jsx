import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Check, X, Clock, ShieldCheck, Ban, RefreshCw } from 'lucide-react';

const STATUS_STYLES = {
  pending: { label: 'Pending', cls: 'bg-amber-500/15 text-amber-400', icon: Clock },
  approved: { label: 'Approved', cls: 'bg-emerald-500/15 text-emerald-400', icon: ShieldCheck },
  rejected: { label: 'Rejected', cls: 'bg-red-500/15 text-red-400', icon: Ban },
};

export default function Approvals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('renttrack_users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      alert('Could not load users.\n\n' + error.message);
    }
    setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const setStatus = async (id, status) => {
    const { error } = await supabase
      .from('renttrack_users')
      .update({ status })
      .eq('id', id);
    if (error) {
      alert('Could not update user.\n\n' + error.message);
      return;
    }
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, status } : u)));
  };

  const pending = users.filter(u => u.status === 'pending');
  const others = users.filter(u => u.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Approvals</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pending.length} pending request{pending.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : users.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-16 text-center text-slate-400">
          No sign-ups yet.
        </div>
      ) : (
        <>
          <Section title="Pending requests" items={pending} onSet={setStatus} showActions />
          <Section title="All users" items={others} onSet={setStatus} />
        </>
      )}
    </div>
  );
}

function Section({ title, items, onSet, showActions }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
      <h2 className="text-slate-300 text-sm font-semibold">{title}</h2>
      <div className="space-y-2">
        {items.map(u => {
          const s = STATUS_STYLES[u.status] || STATUS_STYLES.pending;
          const Icon = s.icon;
          return (
            <div
              key={u.id}
              className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{u.email || u.id}</p>
                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                  <Icon size={12} /> {s.label}
                </span>
              </div>
              <div className="flex gap-2">
                {u.status !== 'approved' && (
                  <button
                    onClick={() => onSet(u.id, 'approved')}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Check size={14} /> Approve
                  </button>
                )}
                {u.status !== 'rejected' && (
                  <button
                    onClick={() => onSet(u.id, 'rejected')}
                    className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    <X size={14} /> Reject
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
