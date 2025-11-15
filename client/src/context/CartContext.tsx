// client/src/context/CartContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// Tipe data untuk produk (bisa disesuaikan dari ProductList)
interface Product {
  product_id: number;
  product_name: string;
  selling_price: number;
  // tambahkan properti lain jika perlu
}

// Tipe data untuk item di keranjang
export interface CartItem extends Product {
  quantity: number;
}

// Tipe data untuk Context
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartSubtotal: number;
}

// Buat Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook kustom untuk memakai context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart harus dipakai di dalam CartProvider");
  }
  return context;
};

// Provider
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Logika Tambah ke Keranjang
  const addToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product_id === product.product_id
      );
      if (existingItem) {
        // Jika sudah ada, update quantity-nya
        return prevCart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Jika baru, tambahkan ke keranjang
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  // Logika Update Kuantitas
  const updateQuantity = (productId: number, quantity: number) => {
    setCart(
      (prevCart) =>
        prevCart
          .map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          )
          .filter((item) => item.quantity > 0) // Hapus jika kuantitas jadi 0
    );
  };

  // Logika Hapus dari Keranjang
  const removeFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product_id !== productId)
    );
  };

  // Logika Bersihkan Keranjang
  const clearCart = () => {
    setCart([]);
  };

  // Kalkulasi Subtotal (Harga asli * kuantitas)
  const cartSubtotal = cart.reduce(
    (total, item) => total + item.selling_price * item.quantity,
    0
  );

  // (Nanti bisa tambahkan logika diskon di sini)
  const cartTotal = cartSubtotal;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
