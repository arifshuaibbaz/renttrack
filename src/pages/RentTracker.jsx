import { useState } from 'react';
import { CheckCircle2, AlertCircle, Plus, Trash2, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, monthLabel, currentMonthStr } from '../utils/storage';
import { useData } from '../hooks/useData';

function getPrevMonth(m) {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function getNextMonth(m) {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function RentTracker() {
  const { properties, payments, recordPayment, deletePayment, getPaymentForProperty } = useData();
  const [month, setMonth] = useState(currentMonthStr);
  const [modal, setModal] = useState(null); // { propertyId, existing }
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const isCurrentMonth = month === currentMonthStr();

  const openModal = (prop) => {
    const existing = getPaymentForProperty(prop.id, month);
    setModal({ prop, existing });
    setAmount(existing ? String(existing.amount) : String(prop.expectedRent));
    setNote(existing?.note || '');
  };

  const handleRecord = (e) => {
    e.preventDefault();
    if (!amount) return;
    recordPayment(modal.prop.id, month, amount, note);
    setModal(null);
  };

  const handleDelete = (propId) => {
    deletePayment(propId, month);
    setModal(null);
  };

  const totalExpected = properties.reduce((s, p) => s + Number(p.expectedRent || 0), 0);
  const monthPayments = payments.filter(p => p.month === month);
  const totalReceived = monthPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const receivedCount = monthPayments.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Rent Tracker</h1>
        <p className="text-slate-400 text-sm mt-1">Record and track monthly rent payments</p>
      </div>

      {/* Month Selector */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 flex items-center justify-between">
        <button onClick={() => setMonth(getPrevMonth(month))} className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-white font-semibold">{monthLabel(month)}</p>
          {isCurrentMonth && <p className="text-indigo-400 text-xs">Current Month</p>}
        </div>
        <button
          onClick={() => setMonth(getNextMonth(month))}
          disabled={isCurrentMonth}
          className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4">
        <SumCard label="Expected" value={formatCurrency(totalExpected)} color="slate" />
        <SumCard label="Received" value={formatCurrency(totalReceived)} color="indigo" />
        <SumCard label={`${receivedCount}/${properties.length} collected`} value={formatCurrency(totalExpected - totalReceived) + ' due'} color="amber" />
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Collection Progress</span>
          <span>{properties.length > 0 ? Math.round((receivedCount / properties.length) * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${properties.length > 0 ? (receivedCount / properties.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Property List */}
      {properties.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-16 text-center">
          <p className="text-slate-500">Add properties first to start tracking rent.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map(prop => {
            const pay = getPaymentForProperty(prop.id, month);
            return (
              <div key={prop.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4 flex items-center justify-between hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pay ? 'bg-emerald-900/40' : 'bg-amber-900/30'}`}>
                    {pay ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{prop.name}</p>
                    <p className="text-slate-500 text-xs">{prop.tenant || 'No tenant'} · Expected {formatCurrency(prop.expectedRent)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {pay ? (
                    <div className="text-right">
                      <p className="text-emerald-400 font-semibold text-sm">{formatCurrency(pay.amount)}</p>
                      <p className="text-slate-500 text-xs">{new Date(pay.receivedDate).toLocaleDateString()}</p>
                    </div>
                  ) : (
                    <span className="text-amber-400 text-sm font-medium">Pending</span>
                  )}
                  <button
                    onClick={() => openModal(prop)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-medium transition-all cursor-pointer"
                  >
                    <Plus size={13} /> {pay ? 'Edit' : 'Record'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div>
                <h2 className="text-white font-semibold">Record Rent Payment</h2>
                <p className="text-slate-500 text-xs">{modal.prop.name} · {monthLabel(month)}</p>
              </div>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleRecord} className="p-6 space-y-4">
              <div>
                <label className="text-slate-300 text-xs font-medium block mb-1.5">Amount Received ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder={String(modal.prop.expectedRent)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                />
                <p className="text-slate-500 text-xs mt-1">Expected: {formatCurrency(modal.prop.expectedRent)}</p>
              </div>
              <div>
                <label className="text-slate-300 text-xs font-medium block mb-1.5">Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Paid by bank transfer"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors cursor-pointer">Cancel</button>
                {modal.existing && (
                  <button type="button" onClick={() => handleDelete(modal.prop.id)} className="px-3 py-2.5 rounded-xl border border-red-800 text-red-400 hover:bg-red-900/30 text-sm transition-colors cursor-pointer">
                    <Trash2 size={15} />
                  </button>
                )}
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <Check size={15} /> {modal.existing ? 'Update' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SumCard({ label, value, color }) {
  const colors = { slate: 'text-slate-300', indigo: 'text-indigo-400', amber: 'text-amber-400' };
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className={`font-bold text-base ${colors[color]}`}>{value}</p>
    </div>
  );
}
