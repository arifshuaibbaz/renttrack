import { useState, useCallback } from 'react';
import {
  getProperties, saveProperties,
  getPayments, savePayments,
  generateId
} from '../utils/storage';

export function useData() {
  const [properties, setProperties] = useState(getProperties);
  const [payments, setPayments] = useState(getPayments);

  const addProperty = useCallback((data) => {
    const newProp = { id: generateId(), ...data };
    const updated = [...properties, newProp];
    setProperties(updated);
    saveProperties(updated);
    return newProp;
  }, [properties]);

  const updateProperty = useCallback((id, data) => {
    const updated = properties.map(p => p.id === id ? { ...p, ...data } : p);
    setProperties(updated);
    saveProperties(updated);
  }, [properties]);

  const deleteProperty = useCallback((id) => {
    const updatedProps = properties.filter(p => p.id !== id);
    const updatedPays = payments.filter(p => p.propertyId !== id);
    setProperties(updatedProps);
    setPayments(updatedPays);
    saveProperties(updatedProps);
    savePayments(updatedPays);
  }, [properties, payments]);

  const recordPayment = useCallback((propertyId, month, amount, note = '') => {
    const existing = payments.find(p => p.propertyId === propertyId && p.month === month);
    let updated;
    if (existing) {
      updated = payments.map(p =>
        p.propertyId === propertyId && p.month === month
          ? { ...p, amount: Number(amount), note, receivedDate: new Date().toISOString(), status: 'received' }
          : p
      );
    } else {
      const newPayment = {
        id: generateId(),
        propertyId,
        month,
        amount: Number(amount),
        note,
        receivedDate: new Date().toISOString(),
        status: 'received',
      };
      updated = [...payments, newPayment];
    }
    setPayments(updated);
    savePayments(updated);
  }, [payments]);

  const deletePayment = useCallback((propertyId, month) => {
    const updated = payments.filter(p => !(p.propertyId === propertyId && p.month === month));
    setPayments(updated);
    savePayments(updated);
  }, [payments]);

  const getPaymentsForMonth = useCallback((month) => {
    return payments.filter(p => p.month === month);
  }, [payments]);

  const getPaymentForProperty = useCallback((propertyId, month) => {
    return payments.find(p => p.propertyId === propertyId && p.month === month) || null;
  }, [payments]);

  return {
    properties, payments,
    addProperty, updateProperty, deleteProperty,
    recordPayment, deletePayment,
    getPaymentsForMonth, getPaymentForProperty,
  };
}
