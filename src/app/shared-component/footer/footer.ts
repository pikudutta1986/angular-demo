import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  siteName = 'Ecommerce Store';
  siteEmail = '';
  sitePhone = '';
  siteAddress = '';
  private destroy$ = new Subject<void>();
  
  // Footer links
  footerLinks = {
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' }
    ],
    support: [
      { label: 'Help Center', path: '/help' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Support', path: '/support' }
    ],
    social: [] as { label: string; url: string }[]
  };

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    // Load settings
    this.settingsService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        if (Object.keys(settings).length > 0) {
          this.siteName = this.settingsService.getSiteName();
          this.siteEmail = this.settingsService.getSiteEmail();
          this.sitePhone = this.settingsService.getSitePhone();
          this.siteAddress = this.settingsService.getSiteAddress();
          
          // Update social links dynamically
          this.footerLinks.social = [];
          const facebook = this.settingsService.getSocialFacebook();
          const twitter = this.settingsService.getSocialTwitter();
          const instagram = this.settingsService.getSocialInstagram();
          const linkedin = this.settingsService.getSocialLinkedIn();
          
          if (facebook) this.footerLinks.social.push({ label: 'Facebook', url: facebook });
          if (twitter) this.footerLinks.social.push({ label: 'Twitter', url: twitter });
          if (instagram) this.footerLinks.social.push({ label: 'Instagram', url: instagram });
          if (linkedin) this.footerLinks.social.push({ label: 'LinkedIn', url: linkedin });
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
