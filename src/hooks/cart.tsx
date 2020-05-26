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
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.removeItem('@GoMarketplace');
      const temp = await AsyncStorage.getItem('@GoMarketplace');
      if (temp) {
        setProducts([...JSON.parse(temp)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const prod = products.find(prod => prod.id === product.id);

    if (prod) {
      increment(product.id);
      return;
    }
    setProducts([...products, {...product, quantity: 1}]);

    await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));

  }, [products]);

  const increment = useCallback(async id => {
    const newProducts = products.map(prod => {
      prod.quantity += prod.id === id ? 1 : 0;
      return prod;
    });
    setProducts(newProducts);
    await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(newProducts));
  }, [products]);

  const decrement = useCallback(async id => {
    const newProducts = products.map(prod => {
      if(prod.quantity>1){
        prod.quantity -= prod.id === id ? 1 : 0;
      }
      return prod;
    });
    setProducts(newProducts);
    await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(newProducts));

  }, [products]);

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
