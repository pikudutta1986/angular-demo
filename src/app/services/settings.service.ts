import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SettingValue {
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
}

export interface Settings {
  [key: string]: SettingValue;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly baseUrl = environment.apiBase;
  private settingsCache: Settings = {};
  private settingsLoaded = false;
  private settingsSubject = new BehaviorSubject<Settings>({});
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load settings on service initialization
    this.loadSettings();
  }

  /**
   * Load all settings and cache them
   */
  loadSettings(): Observable<{ success: boolean; data: Settings; message: string }> {
    if (this.settingsLoaded && Object.keys(this.settingsCache).length > 0) {
      return of({ success: true, data: this.settingsCache, message: 'Settings loaded from cache' });
    }

    return this.http.get<{ success: boolean; data: Settings; message: string }>(
      `${this.baseUrl}/admin/settings`
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.settingsCache = response.data;
          this.settingsLoaded = true;
          this.settingsSubject.next(this.settingsCache);
        }
      }),
      catchError(error => {
        console.error('Error loading settings:', error);
        return of({ success: false, data: {}, message: error.message || 'Failed to load settings' });
      })
    );
  }

  /**
   * Get all settings (returns cached if available)
   */
  getSettings(): Observable<{ success: boolean; data: Settings; message: string }> {
    return this.loadSettings();
  }

  /**
   * Get single setting by key (from cache)
   */
  getSettingValue(key: string, defaultValue: any = null): any {
    const setting = this.settingsCache[key];
    if (!setting) return defaultValue;
    
    // Parse value based on type
    switch (setting.type) {
      case 'number':
        return Number(setting.value) || defaultValue;
      case 'boolean':
        return setting.value === 'true' || setting.value === true;
      case 'json':
        try {
          return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
        } catch {
          return defaultValue;
        }
      default:
        return setting.value || defaultValue;
    }
  }

  /**
   * Get single setting by key (from API)
   */
  getSetting(key: string): Observable<{ success: boolean; data: SettingValue & { key: string }; message: string }> {
    return this.http.get<{ success: boolean; data: SettingValue & { key: string }; message: string }>(
      `${this.baseUrl}/admin/settings/${key}`
    );
  }

  /**
   * Update settings (bulk update) and refresh cache
   */
  updateSettings(settings: Settings): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.baseUrl}/admin/settings`,
      settings
    ).pipe(
      tap(() => {
        // Refresh cache after update
        this.settingsLoaded = false;
        this.loadSettings().subscribe();
      })
    );
  }

  /**
   * Update single setting and refresh cache
   */
  updateSetting(key: string, value: any, type: 'string' | 'number' | 'boolean' | 'json' = 'string', description?: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.baseUrl}/admin/settings/${key}`,
      { value, type, description }
    ).pipe(
      tap(() => {
        // Update cache immediately
        this.settingsCache[key] = { value, type, description };
        this.settingsSubject.next(this.settingsCache);
        // Also refresh from server
        this.settingsLoaded = false;
        this.loadSettings().subscribe();
      })
    );
  }

  // Convenience methods for common settings
  getSiteName(): string {
    return this.getSettingValue('site_name', 'Ecommerce Store');
  }

  getSiteEmail(): string {
    return this.getSettingValue('site_email', 'admin@example.com');
  }

  getSitePhone(): string {
    return this.getSettingValue('site_phone', '');
  }

  getSiteAddress(): string {
    return this.getSettingValue('site_address', '');
  }

  getCurrency(): string {
    return this.getSettingValue('currency', 'USD');
  }

  getCurrencySymbol(): string {
    return this.getSettingValue('currency_symbol', '$');
  }

  getTaxRate(): number {
    return this.getSettingValue('tax_rate', 10);
  }

  getShippingCost(): number {
    return this.getSettingValue('shipping_cost', 0);
  }

  getFreeShippingThreshold(): number {
    return this.getSettingValue('free_shipping_threshold', 100);
  }

  getItemsPerPage(): number {
    return this.getSettingValue('items_per_page', 12);
  }

  getSocialFacebook(): string {
    return this.getSettingValue('social_facebook', '');
  }

  getSocialTwitter(): string {
    return this.getSettingValue('social_twitter', '');
  }

  getSocialInstagram(): string {
    return this.getSettingValue('social_instagram', '');
  }

  getSocialLinkedIn(): string {
    return this.getSettingValue('social_linkedin', '');
  }

  getMetaTitle(): string {
    return this.getSettingValue('meta_title', 'Ecommerce Store');
  }

  getMetaDescription(): string {
    return this.getSettingValue('meta_description', 'Shop the best products online');
  }

  getMetaKeywords(): string {
    return this.getSettingValue('meta_keywords', 'ecommerce, shopping, online store');
  }

  getRazorpayKeyId(): string {
    return this.getSettingValue('razorpay_key_id', 'rzp_test_1DP5mmOlF5G5ag');
  }

  isMaintenanceMode(): boolean {
    return this.getSettingValue('maintenance_mode', false);
  }

  isRegistrationEnabled(): boolean {
    return this.getSettingValue('enable_registration', true);
  }

  isReviewsEnabled(): boolean {
    return this.getSettingValue('enable_reviews', true);
  }

  isWishlistEnabled(): boolean {
    return this.getSettingValue('enable_wishlist', true);
  }

  /**
   * Format price with currency symbol
   */
  formatPrice(price: number): string {
    const symbol = this.getCurrencySymbol();
    return `${symbol}${price.toFixed(2)}`;
  }
}

