import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Order, IndividualOrder, MenuItem } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  orders: Order[];
  menuItems: MenuItem[];
  loading: boolean;
  createOrder: (venmoId: string) => Promise<Order>;
  getOrder: (id: string) => Order | undefined;
  addIndividualOrder: (orderId: string, individualOrder: Omit<IndividualOrder, 'id'>) => Promise<void>;
  updateIndividualOrder: (orderId: string, individualOrderId: string, updates: Partial<IndividualOrder>) => Promise<void>;
  deleteIndividualOrder: (orderId: string, individualOrderId: string) => Promise<void>;
  updateTip: (orderId: string, tip: number) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  refetchMenuItems: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    fetchData();
    setupRealtimeSubscriptions();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
      
      if (menuError) throw menuError;
      setMenuItems(menuData || []);

      // Fetch orders with their individual orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          individual_orders (*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      
      // Transform the data to match our Order type
      const transformedOrders: Order[] = (ordersData || []).map(order => ({
        id: order.id,
        date: order.date,
        venmoId: order.venmo_id,
        status: order.status as 'active' | 'completed',
        tip: parseFloat(order.tip) || 0,
        orders: (order.individual_orders || []).map((io: any) => ({
          id: io.id,
          name: io.name,
          threeRollCombo: io.three_roll_combo,
          singleRoll: io.single_roll,
          beverage: io.beverage,
          misoSoup: io.miso_soup,
          total: parseFloat(io.total),
          packaged: io.packaged,
          paid: io.paid
        }))
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to menu items changes
    const menuSubscription = supabase
      .channel('menu_items_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'menu_items' },
        () => {
          // Refetch menu items when they change
          fetchMenuItems();
        }
      )
      .subscribe();

    // Subscribe to orders changes
    const ordersSubscription = supabase
      .channel('orders_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Refetch orders when they change
          fetchOrders();
        }
      )
      .subscribe();

    // Subscribe to individual orders changes
    const individualOrdersSubscription = supabase
      .channel('individual_orders_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'individual_orders' },
        () => {
          // Refetch orders when individual orders change
          fetchOrders();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      menuSubscription.unsubscribe();
      ordersSubscription.unsubscribe();
      individualOrdersSubscription.unsubscribe();
    };
  };

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setMenuItems(data);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        individual_orders (*)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const transformedOrders: Order[] = data.map(order => ({
        id: order.id,
        date: order.date,
        venmoId: order.venmo_id,
        status: order.status as 'active' | 'completed',
        orders: (order.individual_orders || []).map((io: any) => ({
          id: io.id,
          name: io.name,
          threeRollCombo: io.three_roll_combo,
          singleRoll: io.single_roll,
          beverage: io.beverage,
          misoSoup: io.miso_soup,
          total: parseFloat(io.total),
          packaged: io.packaged,
          paid: io.paid
        }))
      }));
      setOrders(transformedOrders);
    }
  };

  const createOrder = async (venmoId: string): Promise<Order> => {
    const newOrder = {
      date: new Date().toISOString().split('T')[0],
      venmo_id: venmoId,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(newOrder)
      .select()
      .single();

    if (error) throw error;

    const order: Order = {
      id: data.id,
      date: data.date,
      venmoId: data.venmo_id,
      status: data.status,
      tip: parseFloat(data.tip) || 0,
      orders: []
    };

    // Update local state immediately
    setOrders(prevOrders => [...prevOrders, order]);

    return order;
  };

  const getOrder = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };

  const addIndividualOrder = async (orderId: string, individualOrder: Omit<IndividualOrder, 'id'>): Promise<void> => {
    const dbIndividualOrder = {
      order_id: orderId,
      name: individualOrder.name,
      three_roll_combo: individualOrder.threeRollCombo,
      single_roll: individualOrder.singleRoll,
      beverage: individualOrder.beverage,
      miso_soup: individualOrder.misoSoup,
      total: individualOrder.total,
      packaged: individualOrder.packaged,
      paid: individualOrder.paid
    };

    const { data, error } = await supabase
      .from('individual_orders')
      .insert(dbIndividualOrder)
      .select()
      .single();

    if (error) throw error;

    // Update local state immediately
    if (data) {
      const newIndividualOrder: IndividualOrder = {
        id: data.id,
        name: data.name,
        threeRollCombo: data.three_roll_combo,
        singleRoll: data.single_roll,
        beverage: data.beverage,
        misoSoup: data.miso_soup,
        total: parseFloat(data.total),
        packaged: data.packaged,
        paid: data.paid
      };

      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, orders: [...order.orders, newIndividualOrder] }
            : order
        )
      );
    }
  };

  const updateIndividualOrder = async (orderId: string, individualOrderId: string, updates: Partial<IndividualOrder>): Promise<void> => {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.threeRollCombo !== undefined) dbUpdates.three_roll_combo = updates.threeRollCombo;
    if (updates.singleRoll !== undefined) dbUpdates.single_roll = updates.singleRoll;
    if (updates.beverage !== undefined) dbUpdates.beverage = updates.beverage;
    if (updates.misoSoup !== undefined) dbUpdates.miso_soup = updates.misoSoup;
    if (updates.total !== undefined) dbUpdates.total = updates.total;
    if (updates.packaged !== undefined) dbUpdates.packaged = updates.packaged;
    if (updates.paid !== undefined) dbUpdates.paid = updates.paid;

    const { error } = await supabase
      .from('individual_orders')
      .update(dbUpdates)
      .eq('id', individualOrderId);

    if (error) throw error;

    // Update local state immediately
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId
          ? {
              ...order,
              orders: order.orders.map(io =>
                io.id === individualOrderId
                  ? { ...io, ...updates }
                  : io
              )
            }
          : order
      )
    );
  };

  const deleteIndividualOrder = async (orderId: string, individualOrderId: string): Promise<void> => {
    const { error } = await supabase
      .from('individual_orders')
      .delete()
      .eq('id', individualOrderId);

    if (error) throw error;

    // Update local state immediately
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              orders: order.orders.filter(io => io.id !== individualOrderId)
            }
          : order
      )
    );
  };

  const updateTip = async (orderId: string, tip: number): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .update({ tip })
      .eq('id', orderId);

    if (error) throw error;

    // Update local state immediately
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, tip }
          : order
      )
    );
  };

  const completeOrder = async (orderId: string): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

    if (error) throw error;

    // Update local state immediately
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'completed' }
          : order
      )
    );
  };

  const deleteOrder = async (orderId: string): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;

    // Update local state immediately
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<void> => {
    const { error } = await supabase
      .from('menu_items')
      .insert(item);

    if (error) throw error;
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<void> => {
    const { error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  };

  const deleteMenuItem = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  return (
    <AppContext.Provider value={{
      orders,
      menuItems,
      loading,
      createOrder,
      getOrder,
      addIndividualOrder,
      updateIndividualOrder,
      deleteIndividualOrder,
      updateTip,
      completeOrder,
      deleteOrder,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      refetchMenuItems: fetchMenuItems
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
