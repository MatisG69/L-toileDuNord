import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number) => {
    // Vérifier le stock disponible
    if (product.stock_quantity !== null && product.stock_quantity < quantity) {
      throw new Error(`Stock insuffisant. Disponible: ${product.stock_quantity.toFixed(2)} ${product.unit}`);
    }

    setItems(current => {
      const existing = current.find(item => item.product.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        // Vérifier le stock total (quantité déjà dans le panier + nouvelle quantité)
        if (product.stock_quantity !== null && product.stock_quantity < newQuantity) {
          throw new Error(`Stock insuffisant. Disponible: ${product.stock_quantity.toFixed(2)} ${product.unit}`);
        }
        return current.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      return [...current, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(current => current.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(current => {
      const item = current.find(i => i.product.id === productId);
      if (item) {
        // Vérifier le stock disponible
        if (item.product.stock_quantity !== null && item.product.stock_quantity < quantity) {
          throw new Error(`Stock insuffisant. Disponible: ${item.product.stock_quantity.toFixed(2)} ${item.product.unit}`);
        }
      }
      
      return current.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
