import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutComponent implements OnInit {
  title = 'Checkout';
  cartItems: CartItem[] = [];
  isLoggedIn = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cartItems = this.cartService.getCartItems();
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  getSubtotal(): number {
    return this.cartService.getTotalPrice();
  }

  getShipping(): number {
    return this.getSubtotal() > 0 ? 10 : 0; // Flat shipping rate
  }

  getTax(): number {
    return this.getSubtotal() * 0.1; // 10% tax
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  placeOrder() {
    // Check if user is logged in
    if (!this.isLoggedIn) {
      this.toastService.warning('Please login to place your order', 4000);
      // Redirect to login with return URL
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    // Check if cart is empty
    if (this.cartItems.length === 0) {
      this.toastService.error('Your cart is empty!');
      this.router.navigate(['/products']);
      return;
    }

    // TODO: Implement actual order placement logic with OrderService
    this.toastService.success('Order placed successfully!', 4000);
    this.cartService.clearCart();
    this.router.navigate(['/account']);
  }
}
