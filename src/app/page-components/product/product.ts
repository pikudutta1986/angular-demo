import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew: boolean;
  isSale: boolean;
  tags: string[];
  description: string;
}

interface FilterOptions {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  ratings: number[];
  inStock: boolean;
  isNew: boolean;
  isSale: boolean;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class ProductComponent implements OnInit {
  title = 'Products';
  
  // Product data
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Filter options
  filters: FilterOptions = {
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 1000 },
    ratings: [],
    inStock: false,
    isNew: false,
    isSale: false
  };
  
  // Available filter values
  availableCategories: string[] = [];
  availableBrands: string[] = [];
  
  // UI state
  sortBy: string = 'name';
  viewMode: 'grid' | 'list' = 'grid';
  showFilters: boolean = true;
  currentPage: number = 1;
  itemsPerPage: number = 12;
  
  // Sort options
  sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price', label: 'Price Low to High' },
    { value: 'price-desc', label: 'Price High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' }
  ];

  constructor() {}

  ngOnInit() {
    this.initializeProducts();
    this.initializeFilters();
    this.applyFilters();
  }

  private initializeProducts() {
    this.products = [
      {
        id: 1,
        name: 'Wireless Bluetooth Headphones',
        price: 99.99,
        originalPrice: 149.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        category: 'Electronics',
        brand: 'TechSound',
        rating: 4.5,
        reviewCount: 128,
        inStock: true,
        isNew: false,
        isSale: true,
        tags: ['wireless', 'bluetooth', 'audio'],
        description: 'High-quality wireless headphones with noise cancellation'
      },
      {
        id: 2,
        name: 'Smart Fitness Watch',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        category: 'Electronics',
        brand: 'FitTech',
        rating: 4.8,
        reviewCount: 256,
        inStock: true,
        isNew: true,
        isSale: false,
        tags: ['fitness', 'smartwatch', 'health'],
        description: 'Advanced fitness tracking with heart rate monitoring'
      },
      {
        id: 3,
        name: 'Organic Cotton T-Shirt',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        category: 'Clothing',
        brand: 'EcoWear',
        rating: 4.2,
        reviewCount: 89,
        inStock: true,
        isNew: false,
        isSale: false,
        tags: ['organic', 'cotton', 'sustainable'],
        description: 'Comfortable organic cotton t-shirt for everyday wear'
      },
      {
        id: 4,
        name: 'Professional Camera Lens',
        price: 599.99,
        originalPrice: 799.99,
        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
        category: 'Electronics',
        brand: 'PhotoPro',
        rating: 4.9,
        reviewCount: 67,
        inStock: true,
        isNew: false,
        isSale: true,
        tags: ['camera', 'lens', 'professional'],
        description: 'Professional-grade camera lens for stunning photography'
      },
      {
        id: 5,
        name: 'Leather Crossbody Bag',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        category: 'Accessories',
        brand: 'LeatherCraft',
        rating: 4.6,
        reviewCount: 142,
        inStock: true,
        isNew: true,
        isSale: false,
        tags: ['leather', 'bag', 'fashion'],
        description: 'Elegant leather crossbody bag for any occasion'
      },
      {
        id: 6,
        name: 'Wireless Charging Pad',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
        category: 'Electronics',
        brand: 'ChargeTech',
        rating: 4.3,
        reviewCount: 203,
        inStock: false,
        isNew: false,
        isSale: false,
        tags: ['wireless', 'charging', 'convenience'],
        description: 'Fast wireless charging pad for your devices'
      },
      {
        id: 7,
        name: 'Denim Jacket',
        price: 79.99,
        originalPrice: 99.99,
        image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400',
        category: 'Clothing',
        brand: 'DenimCo',
        rating: 4.4,
        reviewCount: 156,
        inStock: true,
        isNew: false,
        isSale: true,
        tags: ['denim', 'jacket', 'casual'],
        description: 'Classic denim jacket with modern fit'
      },
      {
        id: 8,
        name: 'Stainless Steel Water Bottle',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
        category: 'Accessories',
        brand: 'HydroLife',
        rating: 4.7,
        reviewCount: 98,
        inStock: true,
        isNew: true,
        isSale: false,
        tags: ['water', 'bottle', 'eco-friendly'],
        description: 'Insulated stainless steel water bottle'
      },
      {
        id: 9,
        name: 'Gaming Mechanical Keyboard',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
        category: 'Electronics',
        brand: 'GameTech',
        rating: 4.8,
        reviewCount: 187,
        inStock: true,
        isNew: false,
        isSale: false,
        tags: ['gaming', 'keyboard', 'mechanical'],
        description: 'High-performance mechanical keyboard for gaming'
      },
      {
        id: 10,
        name: 'Running Shoes',
        price: 119.99,
        originalPrice: 149.99,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        category: 'Shoes',
        brand: 'RunFast',
        rating: 4.5,
        reviewCount: 234,
        inStock: true,
        isNew: false,
        isSale: true,
        tags: ['running', 'shoes', 'sports'],
        description: 'Lightweight running shoes for optimal performance'
      },
      {
        id: 11,
        name: 'Bluetooth Speaker',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
        category: 'Electronics',
        brand: 'SoundWave',
        rating: 4.4,
        reviewCount: 145,
        inStock: true,
        isNew: true,
        isSale: false,
        tags: ['speaker', 'bluetooth', 'portable'],
        description: 'Portable Bluetooth speaker with great sound quality'
      },
      {
        id: 12,
        name: 'Canvas Backpack',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        category: 'Accessories',
        brand: 'CanvasCo',
        rating: 4.3,
        reviewCount: 112,
        inStock: true,
        isNew: false,
        isSale: false,
        tags: ['backpack', 'canvas', 'travel'],
        description: 'Durable canvas backpack for everyday use'
      }
    ];
  }

  private initializeFilters() {
    this.availableCategories = [...new Set(this.products.map(p => p.category))];
    this.availableBrands = [...new Set(this.products.map(p => p.brand))];
  }

  onCategoryChange(category: string, checked: boolean) {
    if (checked) {
      this.filters.categories.push(category);
    } else {
      this.filters.categories = this.filters.categories.filter(c => c !== category);
    }
    this.applyFilters();
  }

  onBrandChange(brand: string, checked: boolean) {
    if (checked) {
      this.filters.brands.push(brand);
    } else {
      this.filters.brands = this.filters.brands.filter(b => b !== brand);
    }
    this.applyFilters();
  }

  onPriceRangeChange() {
    this.applyFilters();
  }

  onRatingChange(rating: number, checked: boolean) {
    if (checked) {
      this.filters.ratings.push(rating);
    } else {
      this.filters.ratings = this.filters.ratings.filter(r => r !== rating);
    }
    this.applyFilters();
  }

  onFilterToggle(filter: keyof FilterOptions) {
    this.filters[filter] = !this.filters[filter] as any;
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  onViewModeChange(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  clearAllFilters() {
    this.filters = {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 1000 },
      ratings: [],
      inStock: false,
      isNew: false,
      isSale: false
    };
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.products];

    // Category filter
    if (this.filters.categories.length > 0) {
      filtered = filtered.filter(p => this.filters.categories.includes(p.category));
    }

    // Brand filter
    if (this.filters.brands.length > 0) {
      filtered = filtered.filter(p => this.filters.brands.includes(p.brand));
    }

    // Price range filter
    filtered = filtered.filter(p => 
      p.price >= this.filters.priceRange.min && p.price <= this.filters.priceRange.max
    );

    // Rating filter
    if (this.filters.ratings.length > 0) {
      filtered = filtered.filter(p => 
        this.filters.ratings.some(rating => p.rating >= rating)
      );
    }

    // Stock filter
    if (this.filters.inStock) {
      filtered = filtered.filter(p => p.inStock);
    }

    // New filter
    if (this.filters.isNew) {
      filtered = filtered.filter(p => p.isNew);
    }

    // Sale filter
    if (this.filters.isSale) {
      filtered = filtered.filter(p => p.isSale);
    }

    // Sorting
    this.sortProducts(filtered);

    this.filteredProducts = filtered;
  }

  private sortProducts(products: Product[]) {
    switch (this.sortBy) {
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        products.sort((a, b) => b.id - a.id);
        break;
    }
  }

  getPagedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  getTotalPages() {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  onAddToCart(product: Product) {
    console.log('Added to cart:', product);
    // Implement add to cart logic
  }

  onAddToWishlist(product: Product) {
    console.log('Added to wishlist:', product);
    // Implement add to wishlist logic
  }

  getFloorRating(rating: number): number {
    return Math.floor(rating);
  }

  getCategoryCount(category: string): number {
    return this.products.filter(p => p.category === category).length;
  }

  getBrandCount(brand: string): number {
    return this.products.filter(p => p.brand === brand).length;
  }
}
