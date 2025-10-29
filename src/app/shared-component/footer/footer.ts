import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
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
    social: [
      { label: 'Facebook', url: '#' },
      { label: 'Twitter', url: '#' },
      { label: 'Instagram', url: '#' },
      { label: 'LinkedIn', url: '#' }
    ]
  };
}
