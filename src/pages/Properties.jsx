import { useState } from 'react';
import { Plus, Pencil, Trash2, Building2, X, Check } from 'lucide-react';
import { formatCurrency } from '../utils/storage';

const emptyForm = { name: '', address: '', tenant: '', phone: '', expectedRent: '' };

export default function Properties({ properties, addProperty, updateProperty, deleteProperty }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (prop) => { setForm({ name: prop.name, address: prop.address, tenant: prop.tenant, phone: prop.phone || '', expectedRent: prop.expectedRent }); setEditId(prop.id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.expectedRent) return;
    if (editId) {
      updateProperty(editId, { ...form, expectedRent: Number(form.expectedRent) });
    } else {
      addProperty({ ...form, expectedRent: Number(form.expectedRent) });
    }
    closeForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Properties</h1>
          <p className="text-slate-400 text-sm mt-1">{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} registered</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer">
          <Plus size={16} /> Add Property
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-white font-semibold">{editId ? 'Edit Property' : 'Add New Property'}</h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Field label="Property Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Main St Apartment" />
              <Field label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="123 Main Street, City" />
              <Field label="Tenant Name" value={form.tenant} onChange={v => setForm(f => ({ ...f, tenant: v }))} placeholder="Tenant full name" />
              <Field label="Tenant Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+1 555 000 0000" />
              <Field label="Expected Monthly Rent ($) *" value={form.expectedRent} onChange={v => setForm(f => ({ ...f, expectedRent: v }))} placeholder="1500" type="number" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <Check size={15} /> {editId ? 'Save Changes' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-16 text-center">
          <Building2 size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No properties yet. Add your first property to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map(prop => (
            <div key={prop.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-900/60 flex items-center justify-center">
                    <Building2 size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm leading-tight">{prop.name}</p>
                    <p className="text-slate-500 text-xs">{prop.address || 'No address'}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(prop)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-700 transition-colors cursor-pointer"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteConfirm(prop.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-colors cursor-pointer"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Row label="Tenant" value={prop.tenant || '—'} />
                <Row label="Phone" value={prop.phone || '—'} />
                <Row label="Monthly Rent" value={<span className="text-indigo-400 font-semibold">{formatCurrency(prop.expectedRent)}</span>} />
              </div>

              {deleteConfirm === prop.id && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-xl">
                  <p className="text-red-300 text-xs mb-2">Delete this property and all its rent records?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 text-xs py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white cursor-pointer">Cancel</button>
                    <button onClick={() => { deleteProperty(prop.id); setDeleteConfirm(null); }} className="flex-1 text-xs py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white cursor-pointer">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-slate-300 text-xs font-medium block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className="text-slate-300 text-xs">{value}</span>
    </div>
  );
}
