import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';

// Helper functions to convert between snake_case (database) and camelCase (app)
const formatProperty = (prop) => ({
  ...prop,
  expectedRent: prop.expected_rent,
  createdAt: prop.created_at,
});

const formatPayment = (pay) => ({
  ...pay,
  propertyId: pay.property_id,
  receivedDate: pay.received_date,
  createdAt: pay.created_at,
});

export function useData() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch properties and payments from Supabase
  useEffect(() => {
    if (!user) {
      setProperties([]);
      setPayments([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch properties
        const { data: propsData } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Fetch payments
        const { data: paysData } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setProperties((propsData || []).map(formatProperty));
        setPayments((paysData || []).map(formatPayment));
      } catch (error) {
        console.error('Error fetching data:', error);
        setProperties([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time changes
    const propsSubscription = supabase
      .channel('properties_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      })
      .subscribe();

    const paysSubscription = supabase
      .channel('payments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(propsSubscription);
      supabase.removeChannel(paysSubscription);
    };
  }, [user]);

  const addProperty = useCallback(async (data) => {
    if (!user) return null;

    const { data: newProp, error } = await supabase
      .from('properties')
      .insert([{ ...data, user_id: user.id, expected_rent: Number(data.expectedRent) }])
      .select()
      .single();

    if (error) {
      console.error('Error adding property:', error);
      return null;
    }

    return newProp;
  }, [user]);

  const updateProperty = useCallback(async (id, data) => {
    if (!user) return;

    const updateData = { ...data };
    if (data.expectedRent) updateData.expected_rent = Number(data.expectedRent);
    delete updateData.expectedRent;

    const { error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) console.error('Error updating property:', error);
  }, [user]);

  const deleteProperty = useCallback(async (id) => {
    if (!user) return;

    await supabase
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
  }, [user]);

  const recordPayment = useCallback(async (propertyId, month, amount, note = '') => {
    if (!user) return;

    const existing = payments.find(p => p.property_id === propertyId && p.month === month);

    if (existing) {
      await supabase
        .from('payments')
        .update({
          amount: Number(amount),
          note,
          received_date: new Date().toISOString(),
          status: 'received',
        })
        .eq('id', existing.id)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('payments')
        .insert([{
          user_id: user.id,
          property_id: propertyId,
          month,
          amount: Number(amount),
          note,
          received_date: new Date().toISOString(),
          status: 'received',
        }]);
    }
  }, [user, payments]);

  const deletePayment = useCallback(async (propertyId, month) => {
    if (!user) return;

    await supabase
      .from('payments')
      .delete()
      .eq('property_id', propertyId)
      .eq('month', month)
      .eq('user_id', user.id);
  }, [user]);

  const getPaymentsForMonth = useCallback((month) => {
    return payments.filter(p => p.month === month);
  }, [payments]);

  const getPaymentForProperty = useCallback((propertyId, month) => {
    return payments.find(p => p.property_id === propertyId && p.month === month) || null;
  }, [payments]);

  return {
    properties, payments, loading,
    addProperty, updateProperty, deleteProperty,
    recordPayment, deletePayment,
    getPaymentsForMonth, getPaymentForProperty,
  };
}
