import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (response) {
        setProducts(JSON.parse(response));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const cart = [...products];

      const checkProductExistsIndex = cart.findIndex(
        cartProduct => cartProduct.id === product.id,
      );

      checkProductExistsIndex
        ? cart.push({ ...product, quantity: 1 })
        : (cart[checkProductExistsIndex].quantity += 1);

      setProducts(cart);

      await AsyncStorage.setItem('@GoMarketplace:cart', JSON.stringify(cart));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const cart = [...products];

      const getProductIndex = cart.findIndex(
        cartProduct => cartProduct.id === id,
      );

      if (getProductIndex !== -1) {
        cart[getProductIndex].quantity += 1;

        setProducts(cart);
      }

      await AsyncStorage.setItem('@GoMarketplace:cart', JSON.stringify(cart));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const cart = [...products];

      const getProductIndex = cart.findIndex(
        cartProduct => cartProduct.id === id,
      );

      if (getProductIndex !== -1) {
        cart[getProductIndex].quantity === 1
          ? cart.splice(getProductIndex, 1)
          : (cart[getProductIndex].quantity -= 1);

        setProducts(cart);
      }

      await AsyncStorage.setItem('@GoMarketplace:cart', JSON.stringify(cart));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
