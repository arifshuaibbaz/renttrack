import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Building2, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency, currentMonthStr, monthLabel } from '../utils/storage';
import { useData } from '../hooks/useData';

const MONTHS_BACK = 6;

function getPastMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export default function Dashboard() {
  const { properties, payments } = useData();
  const thisMonth = currentMonthStr();
  const pastMonths = getPastMonths(MONTHS_BACK);

  const thisMonthPayments = payments.filter(p => p.month === thisMonth);
  const received = thisMonthPayments.length;
  const pending = properties.length - received;
  const totalExpected = properties.reduce((s, p) => s + Number(p.expectedRent || 0), 0);
  const totalReceived = thisMonthPayments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const barData = useMemo(() => pastMonths.map(month => {
    const monthPayments = payments.filter(p => p.month === month);
    const collected = monthPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const label = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    return { month: label, collected, expected: totalExpected };
  }), [payments, pastMonths, totalExpected]);

  const pieData = [
    { name: 'Received', value: received, color: '#6366f1' },
    { name: 'Pending', value: pending, color: '#334155' },
  ];

  const propertyStatus = properties.map(prop => {
    const pay = payments.find(p => p.propertyId === prop.id && p.month === thisMonth);
    return { ...prop, payment: pay };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">{monthLabel(thisMonth)} overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<Building2 size={20} />} label="Total Properties" value={properties.length} color="indigo" />
        <StatCard icon={<DollarSign size={20} />} label="Expected This Month" value={formatCurrency(totalExpected)} color="violet" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Received" value={formatCurrency(totalReceived)} color="emerald" />
        <StatCard icon={<AlertCircle size={20} />} label="Pending Properties" value={pending} color="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">Rent Collection (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
                formatter={(v, name) => [formatCurrency(v), name]}
              />
              <Bar dataKey="expected" fill="#1e293b" radius={4} name="Expected" />
              <Bar dataKey="collected" fill="#6366f1" radius={4} name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">This Month Status</h2>
          {properties.length === 0 ? (
            <p className="text-slate-500 text-sm text-center mt-12">No properties added yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="text-center mt-2">
            <p className="text-3xl font-bold text-indigo-400">{properties.length > 0 ? Math.round((received / properties.length) * 100) : 0}%</p>
            <p className="text-slate-400 text-xs">Collection rate</p>
          </div>
        </div>
      </div>

      {/* Property Status List */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-white font-semibold">Property Rent Status — {monthLabel(thisMonth)}</h2>
        </div>
        {propertyStatus.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-10">Add properties to track rent status</p>
        ) : (
          <div className="divide-y divide-slate-700">
            {propertyStatus.map(prop => (
              <div key={prop.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-white text-sm font-medium">{prop.name}</p>
                  <p className="text-slate-500 text-xs">{prop.address}</p>
                </div>
                <div className="text-right">
                  {prop.payment ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-900/40 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium">
                      <CheckCircle2 size={12} /> {formatCurrency(prop.payment.amount)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-amber-900/40 text-amber-400 text-xs px-2.5 py-1 rounded-full font-medium">
                      <AlertCircle size={12} /> Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    indigo: 'bg-indigo-900/40 text-indigo-400',
    violet: 'bg-violet-900/40 text-violet-400',
    emerald: 'bg-emerald-900/40 text-emerald-400',
    amber: 'bg-amber-900/40 text-amber-400',
  };
  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-white text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}
