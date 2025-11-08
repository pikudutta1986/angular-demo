import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { ProductService, ProductDto } from '../../services/product.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
  createdAt?: string;
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
export class ProductComponent implements OnInit, OnDestroy {
  title = 'Products';
  private destroy$ = new Subject<void>();
  private previousUrl = '';
  
  // Product data
  products: Product[] = [];
  filteredProducts: Product[] = [];
  totalProducts: number = 0;
  totalPages: number = 0;
  allProductsCache: ProductDto[] = []; // Cache for total count calculation
  
  // Filter options
  filters: FilterOptions = {
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 0 },
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
  isLoading: boolean = false;
  errorMessage: string | null = null;
  
  // Sort options
  sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price', label: 'Price Low to High' },
    { value: 'price-desc', label: 'Price High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' }
  ];

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load paginated products immediately
    this.loadProducts();
    // Also load all products in background for filter options and total count
    this.loadAllProductsForFiltering();

    // Listen to router navigation events to reload when navigating to this route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects || event.url;
        
        // Only reload if we're navigating TO /products from a different route
        if ((currentUrl === '/products' || currentUrl.startsWith('/products')) && this.previousUrl !== currentUrl) {
          // Reset to first page when navigating to products page
          this.currentPage = 1;
          // Reset filters if navigating from another page (without query params)
          if (!currentUrl.startsWith('/products?')) {
            // Reset filters without calling loadProducts (we'll call it after)
            const priceRange = this.allProductsCache.length > 0 
              ? (() => {
                  const allMapped = this.allProductsCache.map(item => this.mapDtoToProduct(item));
                  const prices = allMapped.map(p => p.price);
                  return { 
                    min: Math.floor(Math.min(...prices)), 
                    max: Math.ceil(Math.max(...prices)) 
                  };
                })()
              : { min: 0, max: 0 };
            
            this.filters = {
              categories: [],
              brands: [],
              priceRange: priceRange,
              ratings: [],
              inStock: false,
              isNew: false,
              isSale: false
            };
          }
          this.loadProducts();
        }
        
        // Update previous URL
        this.previousUrl = currentUrl;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private mapDtoToProduct(dto: ProductDto): Product {
    // Extract first image from pipe-separated string
    const imageUrl = dto.images?.split('|')[0]?.trim() || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    
    // Extract tags from specification or use empty array
    const tags = dto.specification ? dto.specification.split('|').map(s => s.trim()) : [];
    
    // Calculate if product is new (created within last 30 days)
    const createdAt = new Date(dto.created_at);
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const isNew = daysSinceCreation <= 30;
    
    // Default values for missing fields
    return {
      id: dto.id,
      name: dto.name || '',
      price: dto.price || 0,
      originalPrice: undefined, // API doesn't provide this
      image: imageUrl,
      category: dto.category || 'General',
      brand: 'Brand', // API doesn't provide brand, using default
      rating: 4.0, // Default rating
      reviewCount: 0, // Default review count
      inStock: true, // Default to in stock
      isNew: isNew,
      isSale: false, // API doesn't provide sale status
      tags: tags,
      description: dto.description || '',
      createdAt: dto.created_at
    };
  }

  public loadProducts() {
    this.isLoading = true;
    this.errorMessage = null;
    
    // Build API parameters
    const apiParams: any = {
      page: this.currentPage,
      pageSize: this.itemsPerPage
    };

    // Add category filter (use first selected category if multiple)
    if (this.filters.categories.length > 0) {
      apiParams.category = this.filters.categories[0];
    }

    // Add price range filter
    if (this.filters.priceRange.min > 0) {
      apiParams.minPrice = this.filters.priceRange.min;
    }
    if (this.filters.priceRange.max > 0) {
      apiParams.maxPrice = this.filters.priceRange.max;
    }

    // Add sort parameter
    if (this.sortBy) {
      apiParams.sort = this.sortBy;
    }
    
    this.productService.getProducts(apiParams).subscribe({
      next: (res) => {
        this.isLoading = false;
        const items = res?.data || [];
        
        // Validate response
        if (!res.success) {
          this.errorMessage = res.message || 'Failed to load products';
          this.products = [];
          this.filteredProducts = [];
          return;
        }
        
        this.products = items.map(item => this.mapDtoToProduct(item));
        this.filteredProducts = [...this.products];
        
        // Use server-side pagination if available
        if (res.total !== undefined) {
          this.totalProducts = res.total;
          this.totalPages = res.totalPages || Math.ceil(res.total / this.itemsPerPage);
        } else {
          // Calculate total from cached products with same filters
          if (this.allProductsCache.length > 0) {
            this.calculateTotalFromCache();
          } else {
            // If cache not ready, estimate from current page (will be updated when cache loads)
            // Assume there are more pages if we got a full page of results
            if (items.length === this.itemsPerPage) {
              this.totalPages = this.currentPage + 1; // At least one more page
            } else {
              this.totalPages = Math.max(1, this.currentPage);
            }
            this.totalProducts = this.totalPages * this.itemsPerPage;
          }
        }
        
        this.initializeFilters();
        // Apply client-side filters only if any are active
        if (this.hasActiveClientSideFilters()) {
          this.applyClientSideFilters();
        } else {
          // No client-side filters, use products as-is from server
          this.filteredProducts = [...this.products];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading products:', err);
        
        // Handle different error types
        if (err.status === 404) {
          this.errorMessage = 'No products found';
        } else if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Invalid request';
        } else if (err.status >= 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else if (err.status === 0) {
          this.errorMessage = 'Network error. Please check your connection.';
        } else {
          this.errorMessage = err.error?.message || err.message || 'Failed to load products';
        }
        
        this.products = [];
        this.filteredProducts = [];
        this.totalProducts = 0;
        this.totalPages = 0;
      }
    });
  }

  private calculateTotalFromCache() {
    // Apply same filters to cached products to get total count
    let filtered = [...this.allProductsCache];

    // Category filter
    if (this.filters.categories.length > 0) {
      filtered = filtered.filter(p => this.filters.categories.includes(p.category));
    }

    // Price range filter
    if (this.filters.priceRange.min > 0 || this.filters.priceRange.max > 0) {
      filtered = filtered.filter(p => 
        p.price >= this.filters.priceRange.min && p.price <= this.filters.priceRange.max
      );
    }

    this.totalProducts = filtered.length;
    this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
  }

  private loadAllProductsForFiltering() {
    // Load all products without pagination to get filter options and total count
    this.productService.getProducts({}).subscribe({
      next: (res) => {
        const allItems = res?.data || [];
        this.allProductsCache = allItems;
        
        // Initialize filters from all products
        this.initializeFiltersFromAllProducts(allItems);
        
        // Recalculate total based on current filters
        if (this.filters.categories.length > 0 || this.filters.priceRange.min > 0 || this.filters.priceRange.max > 0) {
          this.calculateTotalFromCache();
        } else {
          // No filters applied, use total from all products
          this.totalProducts = res?.total || allItems.length;
          if (res.totalPages) {
            this.totalPages = res.totalPages;
          } else {
            this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
          }
        }
      },
      error: (err) => {
        console.error('Error loading all products for filtering:', err);
        // Don't block UI if cache fails, but try to use current products for filters
        if (this.products.length > 0) {
          this.initializeFilters();
        }
      }
    });
  }

  private initializeFiltersFromAllProducts(allProducts: ProductDto[]) {
    const allMapped = allProducts.map(item => this.mapDtoToProduct(item));
    this.availableCategories = [...new Set(allMapped.map(p => p.category))];
    this.availableBrands = [...new Set(allMapped.map(p => p.brand))];
    
    if (allMapped.length > 0) {
      const prices = allMapped.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (this.filters.priceRange.min === 0 && this.filters.priceRange.max === 0) {
        this.filters.priceRange = { 
          min: Math.floor(minPrice), 
          max: Math.ceil(maxPrice) 
        };
      }
    }
  }

  private initializeFilters() {
    // Extract categories and brands from current page products
    this.availableCategories = [...new Set(this.products.map(p => p.category))];
    this.availableBrands = [...new Set(this.products.map(p => p.brand))];
    
    // Set price range based on actual products if not already set
    if (this.products.length > 0 && (this.filters.priceRange.min === 0 && this.filters.priceRange.max === 0)) {
      const prices = this.products.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      this.filters.priceRange = { 
        min: Math.floor(minPrice), 
        max: Math.ceil(maxPrice) 
      };
    }
  }

  onCategoryChange(category: string, checked: boolean) {
    if (checked) {
      this.filters.categories.push(category);
    } else {
      this.filters.categories = this.filters.categories.filter(c => c !== category);
    }
    this.currentPage = 1;
    this.calculateTotalFromCache();
    this.loadProducts();
  }

  onBrandChange(brand: string, checked: boolean) {
    if (checked) {
      this.filters.brands.push(brand);
    } else {
      this.filters.brands = this.filters.brands.filter(b => b !== brand);
    }
    this.currentPage = 1;
    this.applyClientSideFilters();
  }

  onPriceRangeChange() {
    this.currentPage = 1;
    this.calculateTotalFromCache();
    this.loadProducts();
  }

  onRatingChange(rating: number, checked: boolean) {
    if (checked) {
      this.filters.ratings.push(rating);
    } else {
      this.filters.ratings = this.filters.ratings.filter(r => r !== rating);
    }
    this.currentPage = 1;
    this.applyClientSideFilters();
  }

  onFilterToggle(filter: keyof FilterOptions) {
    this.filters[filter] = !this.filters[filter] as any;
    this.currentPage = 1;
    this.applyClientSideFilters();
  }

  onSortChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  onViewModeChange(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  clearAllFilters() {
    // Reset to dynamic price range from cached products
    if (this.allProductsCache.length > 0) {
      const allMapped = this.allProductsCache.map(item => this.mapDtoToProduct(item));
      const prices = allMapped.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      this.filters.priceRange = { 
        min: Math.floor(minPrice), 
        max: Math.ceil(maxPrice) 
      };
    } else {
      this.filters.priceRange = { min: 0, max: 0 };
    }
    
    this.filters = {
      categories: [],
      brands: [],
      priceRange: this.filters.priceRange,
      ratings: [],
      inStock: false,
      isNew: false,
      isSale: false
    };
    this.currentPage = 1;
    this.calculateTotalFromCache();
    this.loadProducts();
  }

  private hasActiveClientSideFilters(): boolean {
    return this.filters.brands.length > 0 ||
           this.filters.ratings.length > 0 ||
           this.filters.inStock ||
           this.filters.isNew ||
           this.filters.isSale;
  }

  private applyClientSideFilters() {
    // Apply client-side filters that API doesn't support (brand, rating, stock, new, sale)
    let filtered = [...this.products];

    // Brand filter (client-side)
    if (this.filters.brands.length > 0) {
      filtered = filtered.filter(p => this.filters.brands.includes(p.brand));
    }

    // Rating filter (client-side)
    if (this.filters.ratings.length > 0) {
      filtered = filtered.filter(p => 
        this.filters.ratings.some(rating => p.rating >= rating)
      );
    }

    // Stock filter (client-side)
    if (this.filters.inStock) {
      filtered = filtered.filter(p => p.inStock);
    }

    // New filter (client-side)
    if (this.filters.isNew) {
      filtered = filtered.filter(p => p.isNew);
    }

    // Sale filter (client-side)
    if (this.filters.isSale) {
      filtered = filtered.filter(p => p.isSale);
    }

    // Client-side sorting (if server didn't sort)
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
        products.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return b.id - a.id;
        });
        break;
    }
  }

  getPagedProducts() {
    // With server-side pagination, products are already paged
    return this.filteredProducts;
  }

  getTotalPages(): number {
    // Use server-side totalPages if available, otherwise calculate
    if (this.totalPages > 0) {
      return this.totalPages;
    }
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const total = this.getTotalPages();
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
