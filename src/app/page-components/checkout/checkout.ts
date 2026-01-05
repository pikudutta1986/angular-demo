import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { OrderService } from '../../services/order.service';
import { PaymentService, RazorpayPaymentResponse } from '../../services/payment.service';
import { SettingsService } from '../../services/settings.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  title = 'Checkout';
  cartItems: CartItem[] = [];
  isLoggedIn = false;
  currentUser: User | null = null;
  checkoutForm: FormGroup;
  isProcessing = false;
  isPaymentProcessing = false;
  currencySymbol = '$';
  taxRate = 10;
  shippingCost = 0;
  freeShippingThreshold = 100;
  siteName = 'Ecommerce Store';
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private settingsService: SettingsService,
    private fb: FormBuilder
  ) {
    this.checkoutForm = this.fb.group({
      // Shipping Address
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],
      country: ['India', [Validators.required]]
    });
  }

  ngOnInit() {
    // Load settings
    this.settingsService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        if (Object.keys(settings).length > 0) {
          this.currencySymbol = this.settingsService.getCurrencySymbol();
          this.taxRate = this.settingsService.getTaxRate();
          this.shippingCost = this.settingsService.getShippingCost();
          this.freeShippingThreshold = this.settingsService.getFreeShippingThreshold();
          this.siteName = this.settingsService.getSiteName();
        }
      });

    // Check authentication
    this.isLoggedIn = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();

    // Load cart items
    this.cartItems = this.cartService.getCartItems();

    // Redirect if cart is empty
    if (this.cartItems.length === 0) {
      this.toastService.warning('Your cart is empty!');
      this.router.navigate(['/products']);
      return;
    }

    // Redirect if not logged in
    if (!this.isLoggedIn) {
      this.toastService.warning('Please login to checkout');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    // Pre-fill form with user data if available
    if (this.currentUser) {
      this.checkoutForm.patchValue({
        fullName: this.currentUser.name || '',
        email: this.currentUser.email || ''
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getSubtotal(): number {
    return this.cartService.getTotalPrice();
  }

  getShipping(): number {
    const subtotal = this.getSubtotal();
    if (subtotal >= this.freeShippingThreshold) {
      return 0;
    }
    return subtotal > 0 ? this.shippingCost : 0;
  }

  getTax(): number {
    return this.getSubtotal() * (this.taxRate / 100);
  }

  formatPrice(price: number): string {
    return this.settingsService.formatPrice(price);
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  // Form getters for easy access in template
  get fullName() { return this.checkoutForm.get('fullName'); }
  get email() { return this.checkoutForm.get('email'); }
  get phone() { return this.checkoutForm.get('phone'); }
  get address() { return this.checkoutForm.get('address'); }
  get city() { return this.checkoutForm.get('city'); }
  get state() { return this.checkoutForm.get('state'); }
  get zipCode() { return this.checkoutForm.get('zipCode'); }
  get country() { return this.checkoutForm.get('country'); }

  async proceedToPayment() {
    // Validate form
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched();
      this.toastService.error('Please fill all required fields correctly');
      return;
    }

    // Check if cart is empty
    if (this.cartItems.length === 0) {
      this.toastService.error('Your cart is empty!');
      this.router.navigate(['/products']);
      return;
    }

    this.isPaymentProcessing = true;

    try {
      // Create Razorpay order
      const orderAmount = Math.round(this.getTotal() * 100); // Convert to paise
      const receipt = `receipt_${Date.now()}`;

      this.paymentService.createRazorpayOrder({
        amount: orderAmount,
        currency: 'INR',
        receipt: receipt
      }).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.openRazorpayCheckout(response.data);
          } else {
            this.isPaymentProcessing = false;
            this.toastService.error(response.message || 'Failed to create payment order');
          }
        },
        error: (error) => {
          this.isPaymentProcessing = false;
          console.error('Error creating payment order:', error);
          this.toastService.error(error.error?.message || 'Failed to initialize payment. Please try again.');
        }
      });
    } catch (error) {
      this.isPaymentProcessing = false;
      console.error('Error in proceedToPayment:', error);
      this.toastService.error('An error occurred. Please try again.');
    }
  }

  private openRazorpayCheckout(razorpayOrder: any) {
    // Get Razorpay key from order response, settings, or use fallback
    const razorpayKey = razorpayOrder.key_id || this.settingsService.getRazorpayKeyId();
    
    // Ensure Razorpay script is loaded
    if (!this.paymentService.isRazorpayLoaded()) {
      console.log('Waiting for Razorpay script to load...');
      setTimeout(() => {
        if (this.paymentService.isRazorpayLoaded()) {
          this.openRazorpayCheckout(razorpayOrder);
        } else {
          this.isPaymentProcessing = false;
          this.toastService.error('Payment gateway failed to load. Please refresh the page.');
        }
      }, 1000);
      return;
    }
    
    const options = {
      key: razorpayKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || 'INR',
      name: this.siteName,
      description: `Order #${razorpayOrder.receipt || razorpayOrder.id}`,
      order_id: razorpayOrder.id,
      prefill: {
        name: this.checkoutForm.value.fullName,
        email: this.checkoutForm.value.email,
        contact: this.checkoutForm.value.phone
      },
      notes: {
        address: this.getShippingAddressString()
      },
      theme: {
        color: '#667eea'
      },
      modal: {
        ondismiss: () => {
          this.isPaymentProcessing = false;
        }
      }
    };

    this.paymentService.openRazorpayCheckout(
      options,
      (response: RazorpayPaymentResponse) => {
        this.handlePaymentSuccess(response, razorpayOrder);
      },
      (error: any) => {
        this.isPaymentProcessing = false;
        console.error('Payment error:', error);
        if (error.message && error.message.includes('cancelled')) {
          this.toastService.info('Payment cancelled');
        } else {
          this.toastService.error('Payment failed. Please try again.');
        }
      }
    );
  }

  private handlePaymentSuccess(paymentResponse: RazorpayPaymentResponse, razorpayOrder: any) {
    this.isProcessing = true;

    // Verify payment on backend
    this.paymentService.verifyPayment({
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature
    }).subscribe({
      next: (verifyResponse) => {
        if (verifyResponse.success) {
          // Payment verified, now place the order
          this.placeOrder(paymentResponse);
        } else {
          this.isProcessing = false;
          this.isPaymentProcessing = false;
          this.toastService.error('Payment verification failed. Please contact support.');
        }
      },
      error: (error) => {
        this.isProcessing = false;
        this.isPaymentProcessing = false;
        console.error('Payment verification error:', error);
        this.toastService.error('Payment verification failed. Please contact support.');
      }
    });
  }

  private placeOrder(paymentResponse: RazorpayPaymentResponse) {
    // Convert cart items to order products
    const orderProducts = this.cartService.toOrderProducts();

    // Create order
    this.orderService.createOrder({
      products: orderProducts
    }).subscribe({
      next: (orderResponse) => {
        if (orderResponse.success) {
          // Update order status to paid
          const orderId = Array.isArray(orderResponse.data) 
            ? orderResponse.data[0]._id 
            : orderResponse.data._id;

          this.orderService.updateOrder(orderId, {
            status: 'paid'
          }).subscribe({
            next: (updateResponse) => {
              this.isProcessing = false;
              this.isPaymentProcessing = false;
              
              // Clear cart
              this.cartService.clearCart();
              
              // Show success message
              this.toastService.success('Order placed successfully!', 5000);
              
              // Redirect to orders page
              setTimeout(() => {
                this.router.navigate(['/orders']);
              }, 1500);
            },
            error: (error) => {
              console.error('Error updating order status:', error);
              // Order was created but status update failed
              this.isProcessing = false;
              this.isPaymentProcessing = false;
              this.cartService.clearCart();
              this.toastService.success('Order placed successfully!', 5000);
              setTimeout(() => {
                this.router.navigate(['/orders']);
              }, 1500);
            }
          });
        } else {
          this.isProcessing = false;
          this.isPaymentProcessing = false;
          this.toastService.error(orderResponse.message || 'Failed to place order');
        }
      },
      error: (error) => {
        this.isProcessing = false;
        this.isPaymentProcessing = false;
        console.error('Error placing order:', error);
        this.toastService.error(error.error?.message || 'Failed to place order. Please contact support.');
      }
    });
  }

  private getShippingAddressString(): string {
    const formValue = this.checkoutForm.value;
    return `${formValue.address}, ${formValue.city}, ${formValue.state} ${formValue.zipCode}, ${formValue.country}`;
  }

  private markFormGroupTouched() {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      control?.markAsTouched();
    });
  }
}
