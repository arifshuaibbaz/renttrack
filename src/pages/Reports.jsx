import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { formatCurrency, monthLabel } from '../utils/storage';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function getPastMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export default function Reports({ properties, payments }) {
  const pastMonths = getPastMonths(12);

  const monthlyData = useMemo(() => pastMonths.map(month => {
    const monthPayments = payments.filter(p => p.month === month);
    const collected = monthPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const expected = properties.reduce((s, p) => s + Number(p.expectedRent || 0), 0);
    const label = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    return { month: label, collected, expected, pending: expected - collected, rate: expected > 0 ? Math.round((collected / expected) * 100) : 0 };
  }), [payments, properties, pastMonths]);

  const perPropertyData = useMemo(() => properties.map(prop => {
    const propPayments = payments.filter(p => p.propertyId === prop.id);
    const total = propPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const months = propPayments.length;
    return { name: prop.name.length > 14 ? prop.name.slice(0, 14) + '…' : prop.name, total, months, avg: months > 0 ? Math.round(total / months) : 0 };
  }), [properties, payments]);

  const totalEver = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const avgMonthly = monthlyData.length > 0 ? monthlyData.reduce((s, m) => s + m.collected, 0) / monthlyData.length : 0;

  const lastTwo = monthlyData.slice(-2);
  const trend = lastTwo.length === 2 ? lastTwo[1].collected - lastTwo[0].collected : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-slate-400 text-sm mt-1">12-month financial overview</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SumCard label="Total Collected (All Time)" value={formatCurrency(totalEver)} sub={`${payments.length} payments`} />
        <SumCard label="Monthly Average" value={formatCurrency(avgMonthly)} sub="Last 12 months" />
        <SumCard
          label="Month-over-Month Trend"
          value={formatCurrency(Math.abs(trend))}
          sub={trend > 0 ? 'Increase' : trend < 0 ? 'Decrease' : 'No change'}
          icon={trend > 0 ? <TrendingUp size={18} className="text-emerald-400" /> : trend < 0 ? <TrendingDown size={18} className="text-red-400" /> : <Minus size={18} className="text-slate-400" />}
          valueColor={trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-300'}
        />
      </div>

      {/* Line Chart */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
        <h2 className="text-white font-semibold mb-4">Collection Rate (%) — Last 12 Months</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
              formatter={(v) => [`${v}%`, 'Collection Rate']}
            />
            <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
        <h2 className="text-white font-semibold mb-4">Collected vs Pending — Last 12 Months</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
              formatter={(v, n) => [formatCurrency(v), n]}
            />
            <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
            <Bar dataKey="collected" name="Collected" fill="#6366f1" radius={[3, 3, 0, 0]} stackId="a" />
            <Bar dataKey="pending" name="Pending" fill="#334155" radius={[3, 3, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per Property Table */}
      {perPropertyData.length > 0 && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-white font-semibold">Per Property Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-slate-700">
                  <th className="text-left px-5 py-3">Property</th>
                  <th className="text-right px-5 py-3">Payments</th>
                  <th className="text-right px-5 py-3">Total Collected</th>
                  <th className="text-right px-5 py-3">Avg / Month</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {perPropertyData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3 text-white text-sm font-medium">{row.name}</td>
                    <td className="px-5 py-3 text-slate-400 text-sm text-right">{row.months}</td>
                    <td className="px-5 py-3 text-indigo-400 text-sm text-right font-semibold">{formatCurrency(row.total)}</td>
                    <td className="px-5 py-3 text-slate-300 text-sm text-right">{formatCurrency(row.avg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SumCard({ label, value, sub, icon, valueColor = 'text-white' }) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      <div className="flex items-center gap-2">
        {icon}
        <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      </div>
      <p className="text-slate-500 text-xs mt-1">{sub}</p>
    </div>
  );
}
