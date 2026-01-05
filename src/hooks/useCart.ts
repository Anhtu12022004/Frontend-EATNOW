import { useState, useCallback, useMemo } from 'react';
import { CartItem, MenuItem } from '../types';

interface UseCartReturn {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
}

const CART_STORAGE_KEY = 'eatnow_cart';

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());

  const updateItems = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    saveCartToStorage(newItems);
  }, []);

  const addItem = useCallback((item: MenuItem, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((ci) => ci.id === item.id);

      let newItems: CartItem[];
      if (existingItem) {
        newItems = currentItems.map((ci) =>
          ci.id === item.id
            ? { ...ci, quantity: ci.quantity + quantity }
            : ci
        );
      } else {
        newItems = [...currentItems, { ...item, quantity }];
      }

      saveCartToStorage(newItems);
      return newItems;
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((currentItems) => {
      const newItems = currentItems.filter((item) => item.id !== itemId);
      saveCartToStorage(newItems);
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((currentItems) => {
      const newItems = currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      saveCartToStorage(newItems);
      return newItems;
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    updateItems([]);
  }, [updateItems]);

  const getItemQuantity = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      return item?.quantity ?? 0;
    },
    [items]
  );

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return {
    items,
    itemCount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };
}
