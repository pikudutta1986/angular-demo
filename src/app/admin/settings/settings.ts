import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, Settings, SettingValue } from '../../services/settings.service';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-admin-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './settings.html',
    styleUrl: './settings.scss'
})
export class AdminSettingsComponent implements OnInit {
    settings: Settings = {};
    loading = false;
    saving = false;
    errorMessage: string | null = null;
    successMessage: string | null = null;

    // Organized settings groups
    settingsGroups: { [key: string]: { title: string; keys: string[] } } = {
        general: {
            title: 'General Settings',
            keys: ['site_name', 'site_email', 'site_phone', 'site_address', 'currency', 'currency_symbol', 'items_per_page']
        },
        store: {
            title: 'Store Settings',
            keys: ['tax_rate', 'shipping_cost', 'free_shipping_threshold']
        },
        features: {
            title: 'Feature Toggles',
            keys: ['maintenance_mode', 'enable_registration', 'enable_reviews', 'enable_wishlist']
        },
        social: {
            title: 'Social Media',
            keys: ['social_facebook', 'social_twitter', 'social_instagram', 'social_linkedin']
        },
        seo: {
            title: 'SEO Settings',
            keys: ['meta_title', 'meta_description', 'meta_keywords']
        },
        system: {
            title: 'System Settings',
            keys: ['max_upload_size']
        },
        payment: {
            title: 'Payment Gateway Settings',
            keys: ['razorpay_key_id', 'razorpay_key_secret']
        }
    };

    constructor(
        private settingsService: SettingsService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadSettings();
    }

    loadSettings() {
        this.loading = true;
        this.errorMessage = null;
        this.successMessage = null;

        try {
            this.settingsService.getSettings()
                .pipe(
                    timeout(30000),
                    catchError((error) => {
                        console.error('Request error:', error);
                        this.errorMessage = error.message || 'Request timed out or failed';
                        this.loading = false;
                        return of({ 
                            success: false, 
                            data: {},
                            message: error.message 
                        });
                    })
                )
                .subscribe({
                    next: (response: any) => {
                        try {
                            console.log('=== SETTINGS RESPONSE DEBUG ===');
                            console.log('Full response:', response);
                            
                            if (response && response.success && response.data) {
                                this.settings = response.data;
                                console.log('Settings loaded:', this.settings);
                            } else {
                                console.warn('Invalid response structure:', response);
                                this.settings = {};
                                this.errorMessage = response.message || 'Failed to load settings';
                            }
                        } catch (parseError: any) {
                            console.error('Error parsing response:', parseError);
                            this.settings = {};
                            this.errorMessage = 'Error processing response data: ' + (parseError?.message || 'Unknown error');
                        } finally {
                            this.loading = false;
                            this.cdr.detectChanges();
                        }
                    },
                    error: (error) => {
                        console.error('Error loading settings:', error);
                        this.errorMessage = error.error?.message || error.message || 'Failed to load settings';
                        this.loading = false;
                        this.cdr.detectChanges();
                    }
                });
        } catch (err) {
            console.error('Error in loadSettings:', err);
            this.errorMessage = 'Failed to load settings';
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    getSettingValue(key: string): any {
        return this.settings[key]?.value ?? '';
    }

    getSettingType(key: string): string {
        return this.settings[key]?.type || 'string';
    }

    getSettingDescription(key: string): string {
        return this.settings[key]?.description || '';
    }

    updateSettingValue(key: string, value: any) {
        if (!this.settings[key]) {
            this.settings[key] = {
                value: value,
                type: this.inferType(value),
                description: ''
            };
        } else {
            this.settings[key].value = value;
        }
    }

    inferType(value: any): 'string' | 'number' | 'boolean' | 'json' {
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'object') return 'json';
        return 'string';
    }

    saveSettings() {
        this.saving = true;
        this.errorMessage = null;
        this.successMessage = null;

        this.settingsService.updateSettings(this.settings).subscribe({
            next: (response) => {
                if (response.success) {
                    this.successMessage = 'Settings saved successfully!';
                    setTimeout(() => {
                        this.successMessage = null;
                    }, 3000);
                } else {
                    this.errorMessage = response.message || 'Failed to save settings';
                }
                this.saving = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error saving settings:', error);
                this.errorMessage = error.error?.message || error.message || 'Failed to save settings';
                this.saving = false;
                this.cdr.detectChanges();
            }
        });
    }

    resetToDefaults() {
        if (!confirm('Are you sure you want to reset all settings to default values? This cannot be undone.')) {
            return;
        }
        this.loadSettings();
    }

    getAdditionalSettings(): string[] {
        const allGroupedKeys = Object.values(this.settingsGroups).flatMap((group: any) => group.keys);
        return Object.keys(this.settings).filter(key => !allGroupedKeys.includes(key));
    }

    getGroupKeys(): string[] {
        return Object.keys(this.settingsGroups);
    }

    getGroupTitle(groupKey: string): string {
        return this.settingsGroups[groupKey]?.title || '';
    }

    getGroupSettingKeys(groupKey: string): string[] {
        return this.settingsGroups[groupKey]?.keys || [];
    }

    formatSettingKey(key: string): string {
        return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }

    getSettingsCount(): number {
        return Object.keys(this.settings).length;
    }
}

