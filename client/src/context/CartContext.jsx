import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('aura_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        console.error('Error parsing cart items', err);
        setCartItems([]);
      }
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.productId === product.id);

      if (existingItemIndex > -1) {
        const existingItem = prevItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        // Cap quantity at product stock limit
        if (newQuantity > product.stock) {
          alert(`Only ${product.stock} units are currently in stock.`);
          return prevItems;
        }

        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
        };
        return updatedItems;
      } else {
        if (quantity > product.stock) {
          alert(`Only ${product.stock} units are currently in stock.`);
          return prevItems;
        }
        
        return [
          ...prevItems,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            maxStock: product.stock
          }
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex((item) => item.productId === productId);
      if (itemIndex === -1) return prevItems;

      const item = prevItems[itemIndex];
      if (quantity > item.maxStock) {
        alert(`Only ${item.maxStock} units of this item are available.`);
        return prevItems;
      }

      const updatedItems = [...prevItems];
      updatedItems[itemIndex] = {
        ...item,
        quantity: Number(quantity)
      };
      return updatedItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
