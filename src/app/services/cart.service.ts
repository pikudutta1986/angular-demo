import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductDto } from './product.service';

export interface CartItem {
  product: ProductDto;
  quantity: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.getCartFromStorage());
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    // Load cart from storage on initialization
    this.loadCartFromStorage();
  }

  /**
   * Get all cart items
   */
  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  /**
   * Get cart items as observable
   */
  getCartItemsObservable(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  /**
   * Add product to cart
   */
  addToCart(product: ProductDto, quantity: number = 1): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      currentItems[existingItemIndex].quantity += quantity;
      currentItems[existingItemIndex].total = 
        currentItems[existingItemIndex].quantity * product.price;
    } else {
      // Add new item
      currentItems.push({
        product,
        quantity,
        total: product.price * quantity
      });
    }

    this.updateCart(currentItems);
  }

  /**
   * Remove product from cart
   */
  removeFromCart(productId: number): void {
    const currentItems = this.cartItemsSubject.value.filter(
      item => item.product.id !== productId
    );
    this.updateCart(currentItems);
  }

  /**
   * Update product quantity in cart
   */
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItemsSubject.value.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity,
          total: item.product.price * quantity
        };
      }
      return item;
    });

    this.updateCart(currentItems);
  }

  /**
   * Clear all items from cart
   */
  clearCart(): void {
    this.updateCart([]);
  }

  /**
   * Get total number of items in cart
   */
  getTotalItems(): number {
    return this.cartItemsSubject.value.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  /**
   * Get total price of all items in cart
   */
  getTotalPrice(): number {
    return this.cartItemsSubject.value.reduce(
      (total, item) => total + item.total,
      0
    );
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this.cartItemsSubject.value.length === 0;
  }

  /**
   * Get cart item by product ID
   */
  getCartItem(productId: number): CartItem | undefined {
    return this.cartItemsSubject.value.find(item => item.product.id === productId);
  }

  /**
   * Convert cart items to order products format
   */
  toOrderProducts(): Array<{
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }> {
    return this.cartItemsSubject.value.map(item => ({
      product_id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      total: item.total
    }));
  }

  /**
   * Update cart and save to storage
   */
  private updateCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    this.saveCartToStorage(items);
  }

  /**
   * Check if we're in browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Save cart to localStorage
   */
  private saveCartToStorage(items: CartItem[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  /**
   * Load cart from localStorage
   */
  private loadCartFromStorage(): void {
    if (!this.isBrowser()) {
      this.cartItemsSubject.next([]);
      return;
    }
    try {
      const cartStr = localStorage.getItem('cart');
      if (cartStr) {
        const cart = JSON.parse(cartStr);
        this.cartItemsSubject.next(cart);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.cartItemsSubject.next([]);
    }
  }

  /**
   * Get cart from storage (for initialization)
   */
  private getCartFromStorage(): CartItem[] {
    if (!this.isBrowser()) return [];
    try {
      const cartStr = localStorage.getItem('cart');
      return cartStr ? JSON.parse(cartStr) : [];
    } catch (error) {
      console.error('Error getting cart from storage:', error);
      return [];
    }
  }
}

