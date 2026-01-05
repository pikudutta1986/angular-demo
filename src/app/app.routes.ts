import { Routes } from '@angular/router';

// IMPORT COMPONENTS
import { HomeComponent } from './page-components/home/home';
import { LoginComponent } from './page-components/login/login';
import { RegisterComponent } from './page-components/register/register';
import { ProductComponent } from './page-components/product/product';
import { ProductDetailsComponent } from './page-components/product-details/product-details';
import { BlogComponent } from './page-components/blog/blog';
import { BlogDetailsComponent } from './page-components/blog-details/blog';
import { CartComponent } from './page-components/cart/cart';
import { CheckoutComponent } from './page-components/checkout/checkout';
import { AccountComponent } from './page-components/account/account';
import { ForgotPasswordComponent } from './page-components/forgot-password/forgot-password';
import { ResetPasswordComponent } from './page-components/reset-password/reset-password';
import { OrdersComponent } from './page-components/orders/orders';

// IMPORT GUARDS
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/auth.guard';

// IMPORT ADMIN COMPONENTS
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout';
import { AdminDashboardComponent } from './admin/dashboard/dashboard';
import { AdminUsersComponent } from './admin/users/users';
import { AdminOrdersComponent } from './admin/orders/orders';
import { AdminProductsComponent } from './admin/products/products';
import { AdminBlogsComponent } from './admin/blogs/blogs';
import { AdminSettingsComponent } from './admin/settings/settings';

export const routes: Routes = [
  // Home route
  { path: '', component: HomeComponent, title: 'Home' },
  { path: 'home', component: HomeComponent, title: 'Home' },

  // Authentication routes
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Register' },
  { path: 'forgot-password', component: ForgotPasswordComponent, title: 'Forgot Password' },
  { path: 'reset-password', component: ResetPasswordComponent, title: 'Reset Password' },

  // Product routes
  { path: 'products', component: ProductComponent, title: 'Products' },
  { path: 'product/:slug', component: ProductDetailsComponent, title: 'Product Details' },

  // Blog routes
  { path: 'blog', component: BlogComponent, title: 'Blog' },
  { path: 'blog/:id', component: BlogDetailsComponent, title: 'Blog Details' },

  // Shopping routes (accessible without login, but order placement requires login)
  { path: 'cart', component: CartComponent, title: 'Shopping Cart' },
  { path: 'checkout', component: CheckoutComponent, title: 'Checkout' },

  // Account route (protected)
  { path: 'account', component: AccountComponent, title: 'My Account', canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, title: 'My Orders', canActivate: [authGuard] },

  // Admin routes (protected with admin guard)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboardComponent, title: 'Admin Dashboard' },
      { path: 'users', component: AdminUsersComponent, title: 'User Management' },
      { path: 'orders', component: AdminOrdersComponent, title: 'Order Management' },
      { path: 'products', component: AdminProductsComponent, title: 'Product Management' },
      { path: 'blogs', component: AdminBlogsComponent, title: 'Blog Management' },
      { path: 'settings', component: AdminSettingsComponent, title: 'Settings' },
    ]
  },

  // Wildcard route - must be last
  { path: '**', redirectTo: '' }
];
