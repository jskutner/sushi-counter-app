import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Order, IndividualOrder, MenuItem } from '../types';

interface AppContextType {
  orders: Order[];
  menuItems: MenuItem[];
  createOrder: (venmoId: string) => Order;
  getOrder: (id: string) => Order | undefined;
  addIndividualOrder: (orderId: string, individualOrder: IndividualOrder) => void;
  updateIndividualOrder: (orderId: string, individualOrderId: string, updates: Partial<IndividualOrder>) => void;
  completeOrder: (orderId: string) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ORDERS: 'sushi-counter-orders',
  MENU_ITEMS: 'sushi-counter-menu-items'
};

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Spicy salmon', description: 'Fresh salmon with spicy mayo' },
  { id: '2', name: 'Volcano', description: 'Tempura shrimp with spicy sauce' },
  { id: '3', name: 'Cooked tuna', description: 'Seared tuna with teriyaki' },
  { id: '4', name: 'Teriyaki chicken', description: 'Grilled chicken teriyaki' },
  { id: '5', name: 'Miso eggplant', description: 'Grilled miso eggplant' },
  { id: '6', name: 'Avo & cucumber', description: 'Fresh avocado and cucumber' },
  { id: '7', name: 'Salmon', description: 'Classic salmon roll' },
  { id: '8', name: 'Spicy shrimp', description: 'Shrimp with spicy mayo' },
  { id: '9', name: 'Tempura shrimp', description: 'Crispy tempura shrimp' },
  { id: '10', name: 'Sunshine', description: 'Mango and avocado' },
  { id: '11', name: 'Spicy tuna', description: 'Fresh tuna with spicy mayo' }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    return saved ? JSON.parse(saved) : DEFAULT_MENU_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(menuItems));
  }, [menuItems]);

  const createOrder = (venmoId: string): Order => {
    const newOrder: Order = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      venmoId,
      orders: [],
      status: 'active'
    };
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  };

  const getOrder = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };

  const addIndividualOrder = (orderId: string, individualOrder: IndividualOrder) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId
        ? { ...order, orders: [...order.orders, individualOrder] }
        : order
    ));
  };

  const updateIndividualOrder = (orderId: string, individualOrderId: string, updates: Partial<IndividualOrder>) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId
        ? {
            ...order,
            orders: order.orders.map(io =>
              io.id === individualOrderId ? { ...io, ...updates } : io
            )
          }
        : order
    ));
  };

  const completeOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId
        ? { ...order, status: 'completed' as const }
        : order
    ));
  };

  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <AppContext.Provider value={{
      orders,
      menuItems,
      createOrder,
      getOrder,
      addIndividualOrder,
      updateIndividualOrder,
      completeOrder,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem
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

