import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { SettingsService } from '../../services/settings.service';
import { Subject, takeUntil } from 'rxjs';
import { generateProductSlug } from '../../utils/slug.util';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './blog.html',
  styleUrl: './blog.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  title = 'Shopping Cart';
  cartItems: CartItem[] = [];
  totalPrice = 0;
  totalItems = 0;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    // Subscribe to cart items changes
    this.cartService.getCartItemsObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;
        this.updateTotals();
      });

    // Load initial cart items
    this.loadCart();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCart() {
    this.cartItems = this.cartService.getCartItems();
    this.updateTotals();
  }

  updateTotals() {
    this.totalPrice = this.cartService.getTotalPrice();
    this.totalItems = this.cartService.getTotalItems();
  }

  updateQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) {
      this.removeItem(item.product.id);
      return;
    }
    this.cartService.updateQuantity(item.product.id, quantity);
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  getProductImage(product: any): string {
    if (!product.images) return '';
    const images = product.images.split('|').map((img: string) => img.trim()).filter((img: string) => img);
    return images.length > 0 ? images[0] : '';
  }

  formatPrice(price: number): string {
    return this.settingsService.formatPrice(price);
  }

  isEmpty(): boolean {
    return this.cartService.isEmpty();
  }

  getProductSlug(product: any): string {
    return generateProductSlug(product.name, product.id);
  }
}
