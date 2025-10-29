import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  title = 'My App';
  
  // Navigation menu items
  navItems = [
    { label: 'Home', path: '/home' },
    { label: 'Products', path: '/products' },
    { label: 'Blog', path: '/blog' },
    { label: 'Account', path: '/account' }
  ];
}
