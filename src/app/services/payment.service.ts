import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface CreateRazorpayOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

// Razorpay is loaded via script tag in index.html

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = environment.apiBase;
  private razorpayLoaded = false;

  constructor(private http: HttpClient) {
    this.loadRazorpayScript();
  }

  /**
   * Load Razorpay script dynamically
   */
  private loadRazorpayScript(): void {
    if (this.razorpayLoaded || typeof window === 'undefined') {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      this.razorpayLoaded = true;
    };
    document.body.appendChild(script);
  }

  /**
   * Create Razorpay order on backend
   */
  createRazorpayOrder(orderData: CreateRazorpayOrderRequest): Observable<PaymentApiResponse> {
    return this.http.post<PaymentApiResponse>(`${this.baseUrl}/payments/create-order`, orderData);
  }

  /**
   * Verify payment on backend
   */
  verifyPayment(paymentData: VerifyPaymentRequest): Observable<PaymentApiResponse> {
    return this.http.post<PaymentApiResponse>(`${this.baseUrl}/payments/verify-payment`, paymentData);
  }

  /**
   * Initialize Razorpay checkout
   */
  openRazorpayCheckout(
    options: any,
    onSuccess: (response: RazorpayPaymentResponse) => void,
    onError: (error: any) => void
  ): void {
    // Check if Razorpay is loaded
    if (typeof window === 'undefined' || typeof (window as any).Razorpay === 'undefined') {
      // Wait for script to load
      const checkRazorpay = setInterval(() => {
        if (typeof (window as any).Razorpay !== 'undefined') {
          clearInterval(checkRazorpay);
          this.openRazorpayCheckout(options, onSuccess, onError);
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkRazorpay);
        if (typeof (window as any).Razorpay === 'undefined') {
          onError(new Error('Razorpay script failed to load'));
        }
      }, 5000);
      return;
    }

    try {
      const RazorpayInstance = (window as any).Razorpay;
      
      // Update options with handlers
      const razorpayOptions = {
        ...options,
        handler: (response: RazorpayPaymentResponse) => {
          onSuccess(response);
        },
        modal: {
          ...options.modal,
          ondismiss: () => {
            if (options.modal?.ondismiss) {
              options.modal.ondismiss();
            }
            onError(new Error('Payment cancelled by user'));
          }
        }
      };

      const rzp = new RazorpayInstance(razorpayOptions);
      rzp.open();
    } catch (error) {
      console.error('Error opening Razorpay checkout:', error);
      onError(error);
    }
  }

  /**
   * Check if Razorpay is loaded
   */
  isRazorpayLoaded(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).Razorpay !== 'undefined';
  }
}

