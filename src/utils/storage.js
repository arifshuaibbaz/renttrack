const PROPERTIES_KEY = 'rentapp_properties';
const PAYMENTS_KEY = 'rentapp_payments';

export const getProperties = () => {
  try {
    return JSON.parse(localStorage.getItem(PROPERTIES_KEY)) || [];
  } catch {
    return [];
  }
};

export const saveProperties = (properties) => {
  localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
};

export const getPayments = () => {
  try {
    return JSON.parse(localStorage.getItem(PAYMENTS_KEY)) || [];
  } catch {
    return [];
  }
};

export const savePayments = (payments) => {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
};

export const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);

export const monthLabel = (monthStr) => {
  const [year, month] = monthStr.split('-');
  return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const currentMonthStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
